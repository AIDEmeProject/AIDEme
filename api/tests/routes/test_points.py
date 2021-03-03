import os
import json
import dill
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset
from aideme.active_learning import KernelVersionSpace
from aideme.initial_sampling import random_sampler

import src.routes.points
from src.routes.endpoints import INITIAL_UNLABELED_POINTS, NEXT_UNLABELED_POINTS


TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","
SELECTED_COLS = [1, 3]

SIMPLE_MARGIN_CONFIGURATION = {
    "activeLearner": {
        "name": "SimpleMargin",
        "svmLearner": {
            "C": 1024,
            "kernel": {"gamma": 0, "name": "gaussian"},
            "name": "SVM",
        },
    },
    "subsampleSize": 50000,
    "useFactorizationInformation": False,
}

VERSION_SPACE_CONFIGURATION = {
    "activeLearner": {
        "learner": {
            "name": "MajorityVote",
            "sampleSize": 8,
            "versionSpace": {
                "addIntercept": True,
                "hitAndRunSampler": {
                    "cache": True,
                    "rounding": True,
                    "selector": {"name": "WarmUpAndThin", "thin": 10, "warmUp": 100},
                },
                "kernel": {"name": "gaussian"},
                "solver": "ojalgo",
            },
        },
        "name": "UncertaintySampler",
    },
    "subsampleSize": 50000,
    "task": "sdss_Q4_0.1%",
}


def test_get_initial_points_to_label_session_expired(client, monkeypatch):
    monkeypatch.setattr(src.routes.points, "session", {"session_id": "random"})
    monkeypatch.setattr(src.routes.points.db_client, "exists", lambda session_id: 0)

    response = client.post(
        INITIAL_UNLABELED_POINTS,
        data={
            "configuration": json.dumps(SIMPLE_MARGIN_CONFIGURATION),
            "columnIds": json.dumps(SELECTED_COLS),
        },
    )

    assert json.loads(response.data) == {"errorMessage": "Session expired"}


def test_get_initial_points_to_label_session_valid(client, monkeypatch):
    def use_algo(configuration):
        response = client.post(
            INITIAL_UNLABELED_POINTS,
            data={
                "configuration": json.dumps(configuration),
                "columnIds": json.dumps(SELECTED_COLS),
            },
        )
        points_to_label = json.loads(response.data)

        assert isinstance(points_to_label, list)
        assert len(points_to_label) == 3
        assert {"id", "data"} <= points_to_label[0].keys()
        assert "array" in points_to_label[0]["data"]
        assert len(points_to_label[0]["data"]["array"]) == 2

    monkeypatch.setattr(src.routes.points, "session", {"session_id": "random"})
    monkeypatch.setattr(src.routes.points.db_client, "exists", lambda session_id: 1)
    monkeypatch.setattr(
        src.routes.points.db_client,
        "hget",
        lambda session_id, field: SEPARATOR.encode(),
    )
    monkeypatch.setattr(
        src.routes.points.db_client, "hset", lambda session_id, field, value: None
    )
    monkeypatch.setattr(
        src.routes.points,
        "get_dataset_path",
        lambda x: TEST_DATASET_PATH,
    )

    use_algo(SIMPLE_MARGIN_CONFIGURATION)
    use_algo(VERSION_SPACE_CONFIGURATION)


def test_get_next_points_to_label(client, monkeypatch):
    dataset = pd.read_csv(TEST_DATASET_PATH, sep=SEPARATOR, usecols=SELECTED_COLS)
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        KernelVersionSpace(),
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )

    monkeypatch.setattr(src.routes.points, "session", {"session_id": "random"})
    monkeypatch.setattr(src.routes.points.db_client, "exists", lambda session_id: 1)
    monkeypatch.setattr(
        src.routes.points.db_client,
        "hget",
        lambda session_id, field: dill.dumps(exploration_manager),
    )
    monkeypatch.setattr(
        src.routes.points.db_client, "hset", lambda session_id, field, value: None
    )

    response = client.post(
        NEXT_UNLABELED_POINTS,
        data={
            "labeledPoints": json.dumps(
                [
                    {"id": 3, "label": 1, "data": {"array": [8, 0.5]}},
                    {"id": 9, "label": 1, "data": {"array": [43, 0.5]}},
                    {"id": 11, "label": 0, "data": {"array": [28, 0.6]}},
                ]
            )
        },
    )

    points_to_label = json.loads(response.data)

    assert isinstance(points_to_label, list)
    assert len(points_to_label) == 1
    assert {"id", "data"} <= points_to_label[0].keys()
    assert "array" in points_to_label[0]["data"]
    assert len(points_to_label[0]["data"]["array"]) == 2

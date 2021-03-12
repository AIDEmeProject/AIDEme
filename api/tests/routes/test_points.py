import os
import json

import dill
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset
from aideme.explore.partitioned import IndexedDataset
from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.version_space import SubspatialVersionSpace
from aideme.initial_sampling import random_sampler

import src.routes.points
from src.routes.endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from src.routes.points import compute_partition_in_new_indexes, format_points_to_label


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

FACTORIZED_SIMPLE_MARGIN_CONFIGURATION = {
    **SIMPLE_MARGIN_CONFIGURATION,
    "multiTSM": {
        "hasTsm": True,
        "searchUnknownRegionProbability": 0.5,
        "columns": ["age", "indice_glycemique", "sex"],
        "decompose": True,
        "flags": [[True, False], [True, True]],
        "featureGroups": [["age", "indice_glycemique"], ["sex"]],
    },
}

FACTORIZED_VERSION_SPACE_CONFIGURATION = {
    **VERSION_SPACE_CONFIGURATION,
    "multiTSM": {
        "hasTsm": True,
        "searchUnknownRegionProbability": 0.5,
        "columns": ["age", "indice_glycemique", "sex", "indice_glycemique"],
        "decompose": True,
        "flags": [[True, False], [True, False]],
        "featureGroups": [["age", "indice_glycemique"], ["sex", "indice_glycemique"]],
    },
}


def test_compute_partition_in_new_indexes():
    cases = [
        {
            "args": {
                "column_ids": [1, 3, 2],
                "column_names": ["age", "indice_glycemique", "sex"],
                "partition_in_names": [["age", "indice_glycemique"], ["sex"]],
            },
            "expected_output": {
                "partition": [[0, 2], [1]],
                "unique_column_ids": [1, 2, 3],
            },
        },
        {
            "args": {
                "column_ids": [1, 3, 2, 3],
                "column_names": [
                    "age",
                    "indice_glycemique",
                    "sex",
                    "indice_glycemique",
                ],
                "partition_in_names": [
                    ["age", "indice_glycemique"],
                    ["sex", "indice_glycemique"],
                ],
            },
            "expected_output": {
                "partition": [[0, 2], [1, 2]],
                "unique_column_ids": [1, 2, 3],
            },
        },
    ]

    for case in cases:
        assert compute_partition_in_new_indexes(
            case["args"]["column_ids"],
            case["args"]["column_names"],
            case["args"]["partition_in_names"],
        ) == (
            case["expected_output"]["partition"],
            case["expected_output"]["unique_column_ids"],
        )


def test_format_points_to_label():
    cases = [
        {
            "args": {
                "points": IndexedDataset(data=[[33, 1]], index=[0]),
                "partition": None,
            },
            "expected_output": [
                {
                    "id": 0,
                    "data": {"array": [33, 1]},
                }
            ],
        },
        {
            "args": {
                "points": IndexedDataset(data=[[33, 1]], index=[0]),
                "partition": [[0, 1], [0]],
            },
            "expected_output": [
                {
                    "id": 0,
                    "data": {"array": [33, 1, 33]},
                }
            ],
        },
    ]

    for case in cases:
        assert (
            format_points_to_label(
                case["args"]["points"],
                case["args"]["partition"],
            )
            == case["expected_output"]
        )


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


def test_get_initial_points_to_label(client, monkeypatch):
    def use_config(configuration, column_ids):
        response = client.post(
            INITIAL_UNLABELED_POINTS,
            data={
                "configuration": json.dumps(configuration),
                "columnIds": json.dumps(column_ids),
            },
        )
        points_to_label = json.loads(response.data)

        assert isinstance(points_to_label, list)
        assert len(points_to_label) == 3
        assert {"id", "data"} <= points_to_label[0].keys()
        assert "array" in points_to_label[0]["data"]
        assert len(points_to_label[0]["data"]["array"]) == len(column_ids)

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

    use_config(SIMPLE_MARGIN_CONFIGURATION, column_ids=SELECTED_COLS)
    use_config(VERSION_SPACE_CONFIGURATION, column_ids=SELECTED_COLS)
    use_config(FACTORIZED_SIMPLE_MARGIN_CONFIGURATION, column_ids=[1, 3, 2])
    use_config(FACTORIZED_VERSION_SPACE_CONFIGURATION, column_ids=[1, 3, 2, 3])


def test_get_next_points_to_label(client, monkeypatch):
    monkeypatch.setattr(src.routes.points, "session", {"session_id": "random"})
    monkeypatch.setattr(src.routes.points.db_client, "exists", lambda session_id: 1)
    monkeypatch.setattr(
        src.routes.points.db_client, "hset", lambda session_id, field, value: None
    )

    cases = [
        {
            "selected_columns": SELECTED_COLS,
            "partition": None,
            "labeled_points": [
                {"id": 3, "label": 1, "data": {"array": [8, 0.5]}},
                {"id": 9, "label": 1, "data": {"array": [43, 0.5]}},
                {"id": 11, "label": 0, "data": {"array": [28, 0.6]}},
            ],
        },
        {
            "selected_columns": [1, 2, 3],
            "partition": [[0, 2], [1, 2]],
            "labeled_points": [
                {"id": 3, "labels": [1, 0], "data": {"array": [8, 0.5, 0, 0.5]}},
                {"id": 9, "labels": [0, 1], "data": {"array": [43, 0.5, 1, 0.5]}},
                {"id": 11, "labels": [1, 1], "data": {"array": [28, 0.6, 0, 0.6]}},
            ],
        },
    ]

    for case in cases:
        is_tsm = case["partition"] is not None

        dataset = pd.read_csv(
            TEST_DATASET_PATH, sep=SEPARATOR, usecols=case["selected_columns"]
        )
        active_learner = (
            SubspatialVersionSpace(partition=case["partition"])
            if is_tsm
            else KernelVersionSpace()
        )
        exploration_manager = ExplorationManager(
            PartitionedDataset(dataset, copy=False),
            active_learner,
            subsampling=50000,
            initial_sampler=random_sampler(sample_size=3),
        )

        monkeypatch.setattr(
            src.routes.points.db_client,
            "hget",
            lambda session_id, field: dill.dumps(exploration_manager)
            if field == "exploration_manager"
            else dill.dumps(case["partition"]),
        )

        response = client.post(
            NEXT_UNLABELED_POINTS,
            data={"labeledPoints": json.dumps(case["labeled_points"])},
        )

        points_to_label = json.loads(response.data)

        assert isinstance(points_to_label, list)
        assert len(points_to_label) == 1
        assert {"id", "data"} <= points_to_label[0].keys()
        assert "array" in points_to_label[0]["data"]
        assert len(points_to_label[0]["data"]["array"]) == len(
            case["labeled_points"][0]["data"]["array"]
        )

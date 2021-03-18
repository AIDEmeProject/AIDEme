import os
import json
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset

from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

import src.routes.points
from src.routes.endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from src.routes.points import compute_partition_in_new_indexes


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
        assert isinstance(points_to_label[0], int)

    monkeypatch.setattr(
        src.routes.points,
        "get_dataset_path",
        lambda: TEST_DATASET_PATH,
    )
    monkeypatch.setattr(src.routes.points.cache, "get", lambda key: ",")

    use_config(SIMPLE_MARGIN_CONFIGURATION, column_ids=SELECTED_COLS)
    use_config(VERSION_SPACE_CONFIGURATION, column_ids=SELECTED_COLS)
    use_config(FACTORIZED_SIMPLE_MARGIN_CONFIGURATION, column_ids=[1, 3, 2])
    use_config(FACTORIZED_VERSION_SPACE_CONFIGURATION, column_ids=[1, 3, 2, 3])


def test_get_next_points_to_label(client, monkeypatch):
    cases = [
        {
            "selected_columns": SELECTED_COLS,
            "partition": None,
            "labeled_points": [
                {"id": 3, "label": 1},
                {"id": 9, "label": 1},
                {"id": 11, "label": 0},
            ],
        },
        {
            "selected_columns": [1, 2, 3],
            "partition": [[0, 2], [1, 2]],
            "labeled_points": [
                {"id": 3, "labels": [1, 0]},
                {"id": 9, "labels": [0, 1]},
                {"id": 11, "labels": [1, 1]},
            ],
        },
    ]

    for case in cases:
        is_tsm = case["partition"] is not None

        dataset = pd.read_csv(
            TEST_DATASET_PATH, sep=SEPARATOR, usecols=case["selected_columns"]
        )
        active_learner = (
            FactorizedDualSpaceModel(KernelVersionSpace(), partition=case["partition"])
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
            src.routes.points.cache, "get", lambda key: exploration_manager
        )

        response = client.post(
            NEXT_UNLABELED_POINTS,
            data={"labeledPoints": json.dumps(case["labeled_points"])},
        )

        points_to_label = json.loads(response.data)

        assert isinstance(points_to_label, list)
        assert len(points_to_label) == 1
        assert isinstance(points_to_label[0], int)

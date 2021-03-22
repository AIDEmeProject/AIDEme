import os
import json
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset

from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

import src.routes.points
from src.routes.points import (
    encode_and_normalize,
    compute_indexes_mapping,
    compute_partition_in_encoded_indexes,
)
from src.routes.endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from src.routes.points import compute_partition_in_new_indexes

from tests.routes.data import (
    SIMPLE_MARGIN_CONFIGURATION,
    VERSION_SPACE_CONFIGURATION,
    FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
    FACTORIZED_VERSION_SPACE_CONFIGURATION,
)


TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "cars_raw_20.csv"
)
SEPARATOR = ","
SELECTED_COLS = [2, 3]


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


def test_encode_and_normalize():
    transformed_dataset = encode_and_normalize(
        TEST_DATASET_PATH, SEPARATOR, SELECTED_COLS
    )
    assert transformed_dataset.shape[0] == 20
    assert transformed_dataset.shape[1] == 2


def test_compute_indexes_mapping():
    cases = [
        {
            "column_ids": [0, 1],
            "new_column_names": ["0_red", "0_green", "1"],
            "expected_output": {0: [0, 1], 1: [2]},
        },
        {
            "column_ids": [1, 3, 6],
            "new_column_names": ["1", "3_orange", "3_apple", "6_fish"],
            "expected_output": {1: [0], 3: [1, 2], 6: [3]},
        },
    ]

    for case in cases:
        assert (
            compute_indexes_mapping(case["column_ids"], case["new_column_names"])
            == case["expected_output"]
        )


def test_compute_new_partition():
    cases = [
        {
            "partition": [[0, 2], [1]],
            "indexes_mapping": {0: [0, 1], 1: [2], 2: [3, 4]},
            "expected_output": [[0, 1, 3, 4], [2]],
        }
    ]

    for case in cases:
        assert (
            compute_partition_in_encoded_indexes(
                case["partition"], case["indexes_mapping"]
            )
            == case["expected_output"]
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
        transformed_dataset = encode_and_normalize(
            TEST_DATASET_PATH, SEPARATOR, case["selected_columns"]
        )

        if case["partition"] is not None:
            indexes_mapping = compute_indexes_mapping(
                list(range(len(case["selected_columns"]))), transformed_dataset.columns
            )
            new_partition = compute_partition_in_encoded_indexes(
                case["partition"], indexes_mapping
            )
            active_learner = FactorizedDualSpaceModel(
                KernelVersionSpace(), partition=new_partition
            )
        else:
            active_learner = KernelVersionSpace()

        exploration_manager = ExplorationManager(
            PartitionedDataset(
                transformed_dataset,
                copy=False,
            ),
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

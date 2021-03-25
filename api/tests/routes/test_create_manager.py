import os

import pandas as pd
import numpy as np

from src.routes.create_manager import (
    encode_and_normalize,
    compute_indexes_mapping,
    compute_partition_in_encoded_indexes,
    compute_partition_in_new_indexes,
    compute_mode,
)

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "cars_raw_20.csv"
)
SEPARATOR = ","
SELECTED_COLS = [2, 3]


def test_compute_partition_in_new_indexes():
    cases = [
        {
            "partition": [[1, 3], [2]],
            "expected_output": {
                "partition": [[0, 2], [1]],
                "unique_column_ids": [1, 2, 3],
            },
        },
        {
            "partition": [[1, 3], [2, 3]],
            "expected_output": {
                "partition": [[0, 2], [1, 2]],
                "unique_column_ids": [1, 2, 3],
            },
        },
        {
            "partition": [[3, 7], [1]],
            "expected_output": {
                "partition": [[1, 2], [0]],
                "unique_column_ids": [1, 3, 7],
            },
        },
    ]

    for case in cases:
        assert compute_partition_in_new_indexes(case["partition"]) == (
            case["expected_output"]["partition"],
            case["expected_output"]["unique_column_ids"],
        )


def test_encode_and_normalize():
    dataset = pd.read_csv(TEST_DATASET_PATH, SEPARATOR, usecols=SELECTED_COLS)
    transformed_dataset = encode_and_normalize(dataset)
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


def test_compute_mode():
    cases = [
        {
            "partition": [[0, 2], [1]],
            "types": [np.int64, np.int64, np.float64],
            "expected_output": ["persist", "persist"],
        },
        {
            "partition": [[0, 2], [1]],
            "types": [np.object, np.object, np.float64],
            "expected_output": ["persist", "categorical"],
        },
    ]

    for case in cases:
        assert compute_mode(case["partition"], case["types"]) == case["expected_output"]

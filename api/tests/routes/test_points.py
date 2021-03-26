import os
import json

import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset

from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

import src.routes.points
from src.routes.create_manager import (
    encode_and_normalize,
    compute_indexes_mapping,
    compute_partition_in_encoded_indexes,
)
from src.routes.endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)

from tests.routes.data_points import (
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
        dataset = pd.read_csv(
            TEST_DATASET_PATH, SEPARATOR, usecols=case["selected_columns"]
        )
        transformed_dataset = encode_and_normalize(dataset)

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

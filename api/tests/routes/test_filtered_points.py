import os
import shutil
import json

import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import SimpleMargin
from aideme.initial_sampling import random_sampler

import src.routes.filtered_points
from src.routes.filtered_points import filter_points
from src.routes.endpoints import FILTERED_UNLABELED_POINTS
from src.config.general import UPLOAD_FOLDER
from src.utils import get_dataset_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","


def test_filter_points(monkeypatch):
    cases = [
        {
            "filters": [{"columnName": "indice_glycemique"}],
            "expected_num_points": 16,
        },
        {
            "filters": [{"columnName": "sex", "filterValues": []}],
            "expected_num_points": 16,
        },
        {
            "filters": [{"columnName": "age", "min": 66}],
            "expected_num_points": 2,
        },
        {
            "filters": [{"columnName": "age", "max": 23}],
            "expected_num_points": 7,
        },
        {
            "filters": [{"columnName": "sex", "filterValues": [1]}],
            "expected_num_points": 9,
        },
        {
            "filters": [
                {"columnName": "age", "min": 24.82, "max": 48.02},
                {"columnName": "sex", "filterValues": [1]},
                {"columnName": "indice_glycemique"},
            ],
            "expected_num_points": 3,
        },
    ]

    monkeypatch.setattr(src.routes.filtered_points.cache, "get", lambda key: SEPARATOR)
    monkeypatch.setattr(
        src.routes.filtered_points, "get_dataset_path", lambda: TEST_DATASET_PATH
    )

    for case in cases:
        assert filter_points(case["filters"]).sum() == case["expected_num_points"]


def test_filter_points_to_label(client, monkeypatch):
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    shutil.copyfile(TEST_DATASET_PATH, get_dataset_path())

    dataset = pd.read_csv(TEST_DATASET_PATH, sep=SEPARATOR)
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        active_learner=SimpleMargin(),
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )
    exploration_manager.update(LabeledSet(labels=[0, 0, 1], index=[1, 5, 9]))

    monkeypatch.setattr(
        src.routes.filtered_points.cache,
        "get",
        lambda key: exploration_manager if key == "exploration_manager" else SEPARATOR,
    )

    filters = [
        {"columnName": "age", "min": 24.82, "max": 48.02},
        {"columnName": "sex", "filterValues": [1]},
        {"columnName": "indice_glycemique"},
    ]
    response = client.post(
        FILTERED_UNLABELED_POINTS, data={"filters": json.dumps(filters)}
    )

    filtered_unlabeled_points = json.loads(response.data)

    assert filtered_unlabeled_points == [2, 14]

import os
import io
import shutil

import json
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

import src.routes.predictions
from src.routes.endpoints import PREDICTIONS, LABELED_DATASET
from src.config.general import UPLOAD_FOLDER
from src.utils import get_dataset_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","

CASES = [
    {
        "is_tsm": False,
        "selected_columns": [1, 3],
        "active_learner": KernelVersionSpace(),
        "labeled_points": LabeledSet(labels=[0, 0, 1], index=[1, 5, 8]),
    },
    {
        "is_tsm": True,
        "selected_columns": [1, 2, 3],
        "active_learner": FactorizedDualSpaceModel(
            KernelVersionSpace(), partition=[[0, 2], [1, 2]]
        ),
        "labeled_points": LabeledSet(
            labels=[0, 0, 1], partial=[[1, 0], [0, 1], [1, 1]], index=[3, 9, 11]
        ),
    },
]


def create_exploration_manager(dataset, active_learner, labeled_points):
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        active_learner,
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )
    exploration_manager.update(labeled_points)
    return exploration_manager


def test_predict(client, monkeypatch):
    for case in CASES:
        dataset = pd.read_csv(
            TEST_DATASET_PATH, sep=SEPARATOR, usecols=case["selected_columns"]
        )

        monkeypatch.setattr(
            src.routes.predictions.cache,
            "get",
            lambda key: create_exploration_manager(
                dataset, case["active_learner"], case["labeled_points"]
            ),
        )

        response = client.get(PREDICTIONS)
        labeled_dataset = json.loads(response.data)

        assert isinstance(labeled_dataset, list)
        assert len(labeled_dataset) == len(dataset)
        num_positive = 0
        for idx, row in enumerate(labeled_dataset):
            assert row["dataPoint"]["id"] == idx
            if row["label"] == "POSITIVE":
                num_positive += 1
        assert 1 <= num_positive < len(dataset)


def test_download_labeled_dataset(client, monkeypatch):
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    shutil.copyfile(TEST_DATASET_PATH, get_dataset_path())

    dataset = pd.read_csv(
        TEST_DATASET_PATH, sep=SEPARATOR, usecols=CASES[0]["selected_columns"]
    )

    monkeypatch.setattr(
        src.routes.predictions.cache,
        "get",
        lambda key: create_exploration_manager(
            dataset, CASES[0]["active_learner"], CASES[0]["labeled_points"]
        )
        if key == "exploration_manager"
        else SEPARATOR,
    )

    response = client.get(LABELED_DATASET)

    assert response.status_code == 200
    assert response.content_type == "text/csv; charset=utf-8"
    assert (
        response.headers["Content-Disposition"]
        == "attachment; filename=labeled_dataset.csv"
    )

    labeled_dataset = pd.read_csv(
        io.BytesIO(response.data), sep=SEPARATOR, header=None, index_col=0
    )
    assert len(labeled_dataset) == len(dataset)
    assert len(labeled_dataset.columns) == len(dataset.columns) + 1
    assert labeled_dataset.iloc[:, 1].equals(dataset.iloc[:, 1])

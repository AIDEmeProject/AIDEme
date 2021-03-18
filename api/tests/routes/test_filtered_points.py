import os
import shutil
import json

import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import SimpleMargin
from aideme.initial_sampling import random_sampler

import src.routes.filtered_points
from src.routes.endpoints import FILTERED_UNLABELED_POINTS
from src.config.general import UPLOAD_FOLDER
from src.utils import get_dataset_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","


def test_filter_points(client, monkeypatch):
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

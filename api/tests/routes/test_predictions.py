import os
import io
import shutil
import json
import dill
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import KernelVersionSpace
from aideme.initial_sampling import random_sampler

import src.routes.predictions
from src.routes.endpoints import PREDICTIONS, LABELED_DATASET
from src.config.general import UPLOAD_FOLDER
from src.utils import get_session_path, get_dataset_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","
SELECTED_COLS = [1, 3]


def create_exploration_manager(dataset):
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        KernelVersionSpace(),
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )
    exploration_manager.update(LabeledSet(labels=[0, 0, 1], index=[1, 5, 8]))
    return exploration_manager


def test_predict(client, monkeypatch):
    dataset = pd.read_csv(TEST_DATASET_PATH, sep=SEPARATOR, usecols=SELECTED_COLS)

    monkeypatch.setattr(src.routes.predictions, "session", {"session_id": "random"})
    monkeypatch.setattr(
        src.routes.predictions.db_client, "exists", lambda session_id: 1
    )
    monkeypatch.setattr(
        src.routes.predictions.db_client,
        "hget",
        lambda session_id, field: dill.dumps(create_exploration_manager(dataset)),
    )

    response = client.get(PREDICTIONS)
    labeled_dataset = json.loads(response.data)

    assert isinstance(labeled_dataset, list)
    assert len(labeled_dataset) == len(dataset)
    num_positive = 0
    for idx, row in enumerate(labeled_dataset):
        assert row["dataPoint"]["id"] == idx
        assert row["dataPoint"]["data"]["array"] == dataset.iloc[idx].tolist()
        if row["label"] == "POSITIVE":
            num_positive += 1
    assert 1 <= num_positive < len(dataset)


def test_download_labeled_dataset(client, monkeypatch):
    session_id = "random"

    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    session_path = get_session_path(session_id)
    if not os.path.isdir(session_path):
        os.mkdir(session_path)

    shutil.copyfile(TEST_DATASET_PATH, get_dataset_path(session_id))

    dataset = pd.read_csv(TEST_DATASET_PATH, sep=SEPARATOR, usecols=SELECTED_COLS)

    monkeypatch.setattr(src.routes.predictions, "session", {"session_id": session_id})
    monkeypatch.setattr(
        src.routes.predictions.db_client, "exists", lambda session_id: 1
    )
    monkeypatch.setattr(
        src.routes.predictions.db_client,
        "hget",
        lambda session_id, field: dill.dumps(create_exploration_manager(dataset))
        if field == "exploration_manager"
        else SEPARATOR.encode(),
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

    shutil.rmtree(get_session_path(session_id))

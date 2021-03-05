import os
import json
import dill
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import KernelVersionSpace
from aideme.initial_sampling import random_sampler

import src.routes.predictions
from src.routes.endpoints import PREDICTIONS

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","
SELECTED_COLS = [1, 3]


def test_predict(client, monkeypatch):
    dataset = pd.read_csv(TEST_DATASET_PATH, sep=SEPARATOR, usecols=SELECTED_COLS)
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        KernelVersionSpace(),
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )
    exploration_manager.update(LabeledSet(labels=[0, 0, 1], index=[1, 5, 8]))

    monkeypatch.setattr(src.routes.predictions, "session", {"session_id": "random"})
    monkeypatch.setattr(
        src.routes.predictions.db_client, "exists", lambda session_id: 1
    )
    monkeypatch.setattr(
        src.routes.predictions.db_client,
        "hget",
        lambda session_id, field: dill.dumps(exploration_manager),
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

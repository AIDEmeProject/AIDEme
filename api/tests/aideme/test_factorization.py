import os
import dill
import pandas as pd
import numpy as np

from aideme.explore import (
    PartitionedDataset,
    LabeledSet,
    ExplorationManager,
)
from aideme.explore.partitioned import IndexedDataset
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)


def test_dsm():
    active_learners = [
        SimpleMargin(
            C=1024,
            kernel="rbf",
            gamma="auto",
        ),
        KernelVersionSpace(
            n_samples=8,
            add_intercept=True,
            cache_samples=True,
            rounding=True,
            thin=10,
            warmup=100,
            kernel="rbf",
        ),
    ]

    for learner in active_learners:
        dataset = pd.read_csv(TEST_DATASET_PATH, sep=",", usecols=[1, 2, 3]).to_numpy()

        factorized_active_learner = FactorizedDualSpaceModel(
            learner, partition=[[0, 2], [1, 2]]
        )

        exploration_manager = ExplorationManager(
            PartitionedDataset(dataset),
            factorized_active_learner,
            subsampling=None,
            initial_sampler=random_sampler(sample_size=3),
        )

        steps = [
            {"labels": [0, 0, 0], "partitions": [[0, 1], [1, 0], [0, 0]]},
            {"labels": [0, 0, 1], "partitions": [[1, 0], [1, 0], [1, 1]]},
            {"labels": [0], "partitions": [[0, 0]]},
        ]

        run_and_assert_exploration_manager_with_factorization(
            exploration_manager,
            steps,
            dataset,
        )


def run_and_assert_exploration_manager_with_factorization(
    exploration_manager, steps, dataset
):
    all_points_to_label = []
    for step in steps:
        next_points_to_label = exploration_manager.get_next_to_label()

        assert isinstance(next_points_to_label, IndexedDataset)
        assert next_points_to_label.index.shape == (len(step["labels"]),)
        assert next_points_to_label.index.dtype == np.dtype("int64")
        assert (
            next_points_to_label.index.min() >= 0
            and next_points_to_label.index.max() < len(dataset)
        )
        for idx, row in enumerate(next_points_to_label.data):
            assert np.all(row == dataset[next_points_to_label.index[idx]])

        all_points_to_label += next_points_to_label.index.tolist()

        exploration_manager.update(
            LabeledSet(
                labels=step["labels"],
                partial=step["partitions"],
                index=next_points_to_label.index,
            )
        )

        current_active_learner = exploration_manager.active_learner
        exploration_manager.active_learner = None
        assert dill.pickles(exploration_manager)
        exploration_manager.active_learner = current_active_learner

    assert len(set(all_points_to_label)) == len(all_points_to_label)

    all_labels = exploration_manager.compute_user_labels_prediction()
    assert isinstance(all_labels.index, np.ndarray)
    assert isinstance(all_labels.labels, np.ndarray)
    assert len(all_labels.index) == len(dataset)
    assert np.any(all_labels.labels == 1)
    assert np.any(all_labels.labels == 0)


def test_dsm_with_resetting_active_learner():
    dataset = pd.read_csv(TEST_DATASET_PATH, sep=",", usecols=[1, 2, 3]).to_numpy()

    def create_factorized_active_learner():
        return FactorizedDualSpaceModel(
            KernelVersionSpace(),
            partition=[[0, 2], [1, 2]],
            mode=["persist", "persist"],
        )

    # POST initial_unlabeled_points
    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset),
        create_factorized_active_learner(),
        subsampling=None,
        initial_sampler=random_sampler(sample_size=3),
    )
    next_points_to_label = exploration_manager.get_next_to_label()

    # POST next_unlabeled_points
    exploration_manager.active_learner = create_factorized_active_learner()
    exploration_manager.update(
        LabeledSet(
            labels=[0, 0, 1],
            partial=[[1, 0], [1, 0], [1, 1]],
            index=next_points_to_label.index,
        )
    )
    next_points_to_label = exploration_manager.get_next_to_label()

    # POST next_unlabeled_points + GET predictions
    exploration_manager.active_learner = create_factorized_active_learner()
    exploration_manager.update(
        LabeledSet(
            labels=[0],
            partial=[[0, 0]],
            index=next_points_to_label.index,
        )
    )
    next_points_to_label = exploration_manager.get_next_to_label()
    all_labels = exploration_manager.compute_user_labels_prediction()
    assert len(all_labels.index) == len(dataset)

import os
import pandas as pd
import numpy as np

from aideme.explore import PartitionedDataset, LabeledSet, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.initial_sampling import random_sampler

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)


def test_exploration_manager():
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
        full_dataset = pd.read_csv(
            TEST_DATASET_PATH,
            sep=",",
        )
        dataset = PartitionedDataset(
            full_dataset.iloc[:, [1, 3]].to_numpy(), copy=False
        )

        initial_sampler = random_sampler(sample_size=3)

        run_and_assert_exploration_manager(dataset, learner, initial_sampler)


def run_and_assert_exploration_manager(dataset, active_learner, initial_sampler):
    exploration_manager = ExplorationManager(
        dataset, active_learner, subsampling=50000, initial_sampler=initial_sampler
    )

    labeled_points = []
    for _ in range(3):
        next_points_to_label = exploration_manager.get_next_to_label()
        exploration_manager.update(
            LabeledSet([0] * len(next_points_to_label), index=next_points_to_label)
        )
        labeled_points += next_points_to_label.tolist()

        assert isinstance(next_points_to_label, np.ndarray)
        assert next_points_to_label.shape == (3,)
        assert next_points_to_label.dtype == np.dtype("int64")
        assert (
            next_points_to_label.min() >= 0
            and next_points_to_label.max() < dataset.__len__()
        )
        assert len(set(labeled_points)) == len(labeled_points)

    next_points_to_label = exploration_manager.get_next_to_label()
    exploration_manager.update(LabeledSet([0, 1, 1], index=next_points_to_label))
    next_points_to_label = exploration_manager.get_next_to_label()

    assert next_points_to_label.shape == (1,)

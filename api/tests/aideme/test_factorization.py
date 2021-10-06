#  Copyright 2019 École Polytechnique
#
#  Authorship
#    Luciano Di Palma <luciano.di-palma@polytechnique.edu>
#    Enhui Huang <enhui.huang@polytechnique.edu>
#    Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
#    Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
#
#  Disclaimer
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
#    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
#    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
#    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
#    IN THE SOFTWARE.

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

    assert len(set(all_points_to_label)) == len(all_points_to_label)

    all_labels = exploration_manager.compute_user_labels_prediction()
    assert_predictions(all_labels, dataset)

    all_polytope_labels = exploration_manager.data.predict_user_labels(
        exploration_manager.active_learner.polytope_model
    )
    assert_predictions(all_polytope_labels, dataset)


def assert_predictions(predictions, dataset):
    assert isinstance(predictions.index, np.ndarray)
    assert isinstance(predictions.labels, np.ndarray)
    assert len(predictions.index) == len(dataset)
    assert np.any(predictions.labels == 1)
    assert np.any(predictions.labels == 0)

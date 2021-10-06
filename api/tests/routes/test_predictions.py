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
import io
import shutil

import json
import pandas as pd

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

import src.routes.predictions
from src.routes.endpoints import PREDICTIONS, POLYTOPE_PREDICTIONS, LABELED_DATASET
from src.config.general import UPLOAD_FOLDER
from src.utils import get_dataset_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
)
SEPARATOR = ","

CASES = [
    {
        "selected_columns": [1, 3],
        "active_learner": KernelVersionSpace(),
        "labeled_points": LabeledSet(labels=[0, 0, 1], index=[1, 5, 8]),
    },
    {
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

        get_all_labels_and_assert(client, PREDICTIONS, dataset)
        if isinstance(case["active_learner"], FactorizedDualSpaceModel):
            get_all_labels_and_assert(client, POLYTOPE_PREDICTIONS, dataset)


def get_all_labels_and_assert(client, endpoint, dataset):
    response = client.get(endpoint)
    all_labels = json.loads(response.data)

    assert isinstance(all_labels, list)
    assert len(all_labels) == len(dataset)
    num_positive = 0
    for idx, row in enumerate(all_labels):
        assert row["id"] == idx
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
    assert len(labeled_dataset.columns) == 1

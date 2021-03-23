import os
import json
from ast import literal_eval

import pandas as pd
import numpy as np

from aideme.explore import ExplorationManager, PartitionedDataset, LabeledSet
from aideme.active_learning import SimpleMargin
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.initial_sampling import random_sampler

CARS_ENCODED_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "cars_encoded.csv"
)
SEPARATOR = ","
CARS_ENCODED_COLUMNS_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "q1_columns.json"
)
TRACE_PATH = os.path.join(__file__.split(sep="tests")[0], "tests", "data", "q1.csv")


def read_trace(trace_path):
    trace = pd.read_csv(trace_path, sep=",", usecols=["labels", "labeled_indexes"])
    trace["labels"] = trace["labels"].apply(literal_eval)
    trace["labeled_indexes"] = trace["labeled_indexes"].apply(literal_eval)
    return trace


def test_trace_dsm():
    with open(CARS_ENCODED_COLUMNS_PATH) as json_file:
        columns = json.load(json_file)

    dataset = pd.read_csv(CARS_ENCODED_DATASET_PATH, SEPARATOR)

    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset.to_numpy(), copy=False),
        FactorizedDualSpaceModel(
            SimpleMargin(C=1024, kernel="rbf", gamma="auto"),
            partition=columns["factorizationGroups"],
            mode=["persist", "persist", "categorical", "categorical", "categorical"],
        ),
        subsampling=50000,
        initial_sampler=random_sampler(sample_size=3),
    )

    trace = read_trace(TRACE_PATH)

    for i in range(len(trace)):
        print(trace.loc[i, "labeled_indexes"])

        exploration_manager.update(
            LabeledSet(
                labels=[np.prod(group) for group in trace.loc[i, "labels"]],
                partial=trace.loc[i, "labels"],
                index=trace.loc[i, "labeled_indexes"],
            )
        )

        model_predictions = exploration_manager.compute_user_labels_prediction()
        polytope_predictions = exploration_manager.data.predict_user_labels(
            exploration_manager.active_learner.polytope_model
        )

        assert len(model_predictions) == len(dataset)
        assert len(polytope_predictions) == len(dataset)
        # failed at iter 16

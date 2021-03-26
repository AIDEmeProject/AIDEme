import os
import json

from aideme.active_learning.dsm import FactorizedDualSpaceModel

from src.routes.endpoints import TRACE, NEXT_TRACE
from src.routes.create_manager import create_exploration_manager
from src.routes.create_labeled_set import create_labeled_set
from src.routes.predictions import predict
from src.utils import get_trace_dataset_path

from tests.aideme.run_trace_dsm import read_trace
from tests.routes.data_trace import (
    ENCODED_DATASET_NAME,
    SEPARATOR,
    NUM_ROWS,
    SELECTED_COLS_IN_ENCODED_DATASET,
    FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
)

TRACE_PATH = os.path.join(__file__.split(sep="tests")[0], "tests", "data", "q1.csv")


def create_labeled_points(indexes, labels):
    return [{"id": idx, "labels": lab} for idx, lab in zip(indexes, labels)]


def test_trace_without_app():
    exploration_manager = create_exploration_manager(
        get_trace_dataset_path(ENCODED_DATASET_NAME),
        SEPARATOR,
        SELECTED_COLS_IN_ENCODED_DATASET,
        FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
        encode=False,
    )

    trace = read_trace(TRACE_PATH)

    for i in range(len(trace)):
        labeled_points = create_labeled_points(
            trace.loc[i, "labeled_indexes"], trace.loc[i, "labels"]
        )
        exploration_manager.update(create_labeled_set(labeled_points))

        predictions = {"labeledPointsOverGrid": predict(exploration_manager)}
        if isinstance(exploration_manager.active_learner, FactorizedDualSpaceModel):
            predictions["TSMPredictionsOverGrid"] = predict(
                exploration_manager, with_polytope=True
            )

        assert predictions.keys() == {
            "labeledPointsOverGrid",
            "TSMPredictionsOverGrid",
        }
        assert (
            len(predictions["labeledPointsOverGrid"])
            == len(predictions["TSMPredictionsOverGrid"])
            == NUM_ROWS
        )


def test_trace_with_app(client):
    response = client.post(
        TRACE,
        data={
            "configuration": json.dumps(FACTORIZED_SIMPLE_MARGIN_CONFIGURATION),
            "columnIds": json.dumps(SELECTED_COLS_IN_ENCODED_DATASET),
            "encodedDatasetName": ENCODED_DATASET_NAME,
        },
    )

    assert json.loads(response.data) == {"success": True}

    trace = read_trace(TRACE_PATH)

    for i in range(len(trace)):
        labeled_points = create_labeled_points(
            trace.loc[i, "labeled_indexes"], trace.loc[i, "labels"]
        )

        print(labeled_points)

        response = client.post(
            NEXT_TRACE,
            data={"labeledPoints": json.dumps(labeled_points)},
        )

        predictions = json.loads(response.data)
        assert predictions.keys() == {
            "labeledPointsOverGrid",
            "TSMPredictionsOverGrid",
        }
        assert (
            len(predictions["labeledPointsOverGrid"])
            == len(predictions["TSMPredictionsOverGrid"])
            == NUM_ROWS
        )

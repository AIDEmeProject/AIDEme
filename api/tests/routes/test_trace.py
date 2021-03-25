import json

from aideme.explore import ExplorationManager
from aideme.active_learning.dsm import FactorizedDualSpaceModel

import src.routes.trace
from src.routes.endpoints import TRACE, NEXT_TRACE
from src.routes.create_manager import create_exploration_manager
from src.cache import cache
from src.utils import get_trace_dataset_path

from tests.routes.data_trace import (
    ENCODED_DATASET_NAME,
    SEPARATOR,
    SELECTED_COLS_IN_ENCODED_DATASET,
    FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
    LABELED_POINTS,
)


def test_init_trace(client):
    with client:
        response = client.post(
            TRACE,
            data={
                "configuration": json.dumps(FACTORIZED_SIMPLE_MARGIN_CONFIGURATION),
                "columnIds": json.dumps(SELECTED_COLS_IN_ENCODED_DATASET),
                "encodedDatasetName": ENCODED_DATASET_NAME,
            },
        )

        exploration_manager = cache.get("exploration_manager")

        assert json.loads(response.data) == {"success": True}
        assert isinstance(exploration_manager, ExplorationManager)
        assert isinstance(exploration_manager.active_learner, FactorizedDualSpaceModel)


def test_next_trace(client, monkeypatch):
    monkeypatch.setattr(
        src.routes.trace.cache,
        "get",
        lambda key: create_exploration_manager(
            get_trace_dataset_path(ENCODED_DATASET_NAME),
            SEPARATOR,
            SELECTED_COLS_IN_ENCODED_DATASET,
            FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
        ),
    )
    monkeypatch.setattr(src.routes.trace.cache, "set", lambda key, value: None)

    response = client.post(
        NEXT_TRACE, data={"labeledPoints": json.dumps(LABELED_POINTS)}
    )

    predictions = json.loads(response.data)
    assert predictions.keys() == {
        "labeledPointsOverGrid",
        "TSMPredictionsOverGrid",
    }
    assert len(predictions["labeledPointsOverGrid"]) == len(
        predictions["TSMPredictionsOverGrid"]
    )

import json

from aideme.explore import ExplorationManager
from aideme.active_learning.dsm import FactorizedDualSpaceModel

from src.routes.endpoints import TRACE
from src.cache import cache

from tests.routes.data import (
    FACTORIZED_SIMPLE_MARGIN_CONFIGURATION,
    SELECTED_COLS_IN_ENCODED_DATASET,
)


def test_init_trace(client):
    with client:
        response = client.post(
            TRACE,
            data={
                "algorithm": "simplemargintsm",
                "configuration": json.dumps(FACTORIZED_SIMPLE_MARGIN_CONFIGURATION),
                "columnIds": json.dumps(SELECTED_COLS_IN_ENCODED_DATASET),
                "encodedDatasetName": "./cars_encoded.csv",
            },
        )

        exploration_manager = cache.get("exploration_manager")

        assert json.loads(response.data) == {"success": True}
        assert isinstance(exploration_manager, ExplorationManager)
        assert isinstance(exploration_manager.active_learner, FactorizedDualSpaceModel)

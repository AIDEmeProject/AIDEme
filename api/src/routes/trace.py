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

import json

from flask import Blueprint, request, jsonify

from aideme.active_learning.dsm import FactorizedDualSpaceModel

from .endpoints import TRACE, NEXT_TRACE
from .create_manager import create_exploration_manager
from .create_labeled_set import create_labeled_set
from .predictions import predict
from ..utils import get_trace_dataset_path
from ..cache import cache

bp = Blueprint("trace", __name__)


@bp.route(TRACE, methods=["POST"])
def init_trace():
    encoded_dataset_name = request.form["encodedDatasetName"]
    column_ids = json.loads(request.form["columnIds"])
    configuration = json.loads(request.form["configuration"])

    separator = ","

    exploration_manager = create_exploration_manager(
        get_trace_dataset_path(encoded_dataset_name),
        separator,
        column_ids,
        configuration,
        encode=False,
        precomputed_mode=True,
    )

    cache.set("exploration_manager", exploration_manager)

    return jsonify(success=True)


@bp.route(NEXT_TRACE, methods=["POST"])
def get_predictions():
    labeled_points = json.loads(request.form["labeledPoints"])

    exploration_manager = cache.get("exploration_manager")
    exploration_manager.update(create_labeled_set(labeled_points))
    cache.set("exploration_manager", exploration_manager)

    predictions = {"labeledPointsOverGrid": predict(exploration_manager)}

    if isinstance(exploration_manager.active_learner, FactorizedDualSpaceModel):
        predictions["TSMPredictionsOverGrid"] = predict(
            exploration_manager, with_polytope=True
        )

    # predictions["projectionPredictions"] = []

    return jsonify(predictions)

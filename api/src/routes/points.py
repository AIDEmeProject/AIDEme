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
from flask_cors import cross_origin


from .endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from .create_manager import create_exploration_manager
from .create_labeled_set import create_labeled_set
from ..cache import cache
from ..utils import get_dataset_path


bp = Blueprint("points to label", __name__)


@bp.route(INITIAL_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])

    separator = cache.get("separator")

    exploration_manager = create_exploration_manager(
        get_dataset_path(), separator, column_ids, configuration
    )

    cache.set("exploration_manager", exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())


@bp.route(NEXT_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_next_points_to_label():
    labeled_points = json.loads(request.form["labeledPoints"])

    exploration_manager = cache.get("exploration_manager")
    exploration_manager.update(create_labeled_set(labeled_points))
    cache.set("exploration_manager", exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())

import json

from flask import Blueprint, request, jsonify

from .endpoints import TRACE
from ..utils import get_trace_dataset_path
from .points import create_exploration_manager
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
    )

    cache.set("exploration_manager", exploration_manager)

    return jsonify(success=True)

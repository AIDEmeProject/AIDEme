import json

import pandas as pd

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

from .endpoints import FILTERED_UNLABELED_POINTS
from .create_labeled_set import create_labeled_set
from ..config.general import MAX_FILTERED_POINTS
from ..utils import get_dataset_path
from ..cache import cache

bp = Blueprint("filtered points to label", __name__)


def filter_points(filters):
    separator = cache.get("separator")
    columns = [f["columnName"] for f in filters]
    dataset = pd.read_csv(get_dataset_path(), separator, usecols=columns)

    filtered = pd.Series(True, index=list(range(len(dataset))))
    for f in filters:
        col_name = f["columnName"]
        if "min" in f.keys():
            filtered &= dataset[col_name] >= f["min"]
        if "max" in f.keys():
            filtered &= dataset[col_name] <= f["max"]
        if f.get("filterValues"):
            filtered &= dataset[col_name].isin(f["filterValues"])

    return filtered


@bp.route(FILTERED_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def filter_points_to_label():
    filters = json.loads(request.form["filters"])
    labeled_points = json.loads(request.form["labeledPoints"])

    filtered = filter_points(filters)

    exploration_manager = cache.get("exploration_manager")
    if len(labeled_points) > 0:
        exploration_manager.update(create_labeled_set(labeled_points))
        cache.set("exploration_manager", exploration_manager)

    return jsonify(
        filtered.iloc[exploration_manager.data.unlabeled.index]
        .loc[lambda x: x]
        .head(MAX_FILTERED_POINTS)
        .index.tolist()
    )

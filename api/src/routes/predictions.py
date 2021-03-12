import csv

import dill

from flask import Blueprint, session, jsonify, send_file
from flask_cors import cross_origin

from .endpoints import PREDICTIONS, LABELED_DATASET
from ..utils import (
    is_session_expired,
    SESSION_EXPIRED_MESSAGE,
    get_labeled_dataset_path,
)
from ..db import db_client

bp = Blueprint("predictions", __name__)


@bp.route(PREDICTIONS, methods=["GET"])
@cross_origin(supports_credentials=True)
def predict():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    exploration_manager = dill.loads(
        db_client.hget(session["session_id"], "exploration_manager")
    )

    all_labels = exploration_manager.compute_user_labels_prediction()

    response = [
        {
            "dataPoint": {"id": int(idx)},
            "label": "POSITIVE" if label > 0 else "NEGATIVE",
        }
        for (idx, label) in zip(all_labels.index, all_labels.labels)
    ]
    response.sort(key=lambda x: x["dataPoint"]["id"])
    return jsonify(response)


@bp.route(LABELED_DATASET, methods=["GET"])
@cross_origin(supports_credentials=True)
def download_labeled_dataset():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    session_id = session["session_id"]

    separator = db_client.hget(session_id, "separator").decode("utf-8")
    exploration_manager = dill.loads(db_client.hget(session_id, "exploration_manager"))

    all_labels = exploration_manager.compute_user_labels_prediction()

    labeled_dataset_path = get_labeled_dataset_path(session_id)

    with open(labeled_dataset_path, "w") as output:
        writer = csv.writer(output, delimiter=separator)

        for idx in all_labels.index.argsort():
            writer.writerow(
                [int(all_labels.index[idx])]
                + exploration_manager.data.data[idx].tolist()
                + [int(all_labels.labels[idx])]
            )

        output.close()

    return send_file(
        labeled_dataset_path,
        as_attachment=True,
    )

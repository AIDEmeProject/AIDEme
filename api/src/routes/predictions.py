import numpy as np
import dill

from flask import Blueprint, session, jsonify
from flask_cors import cross_origin

from .endpoints import PREDICTIONS
from ..utils import is_session_expired, SESSION_EXPIRED_MESSAGE
from ..db import db_client

bp = Blueprint("predictions", __name__, url_prefix=PREDICTIONS)


def concat(indexes, data, labels):
    return np.hstack((indexes[:, np.newaxis], data, labels[:, np.newaxis]))


@bp.route("", methods=["GET"])
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
            "dataPoint": {"id": int(idx), "data": {"array": row.tolist()}},
            "label": "POSITIVE" if label > 0 else "NEGATIVE",
        }
        for (idx, row, label) in zip(
            all_labels.index, exploration_manager.data.data, all_labels.labels
        )
    ]
    response.sort(key=lambda x: x["dataPoint"]["id"])
    return jsonify(response)

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

    predictions = exploration_manager.active_learner.predict(
        exploration_manager.data.unlabeled.data
    )

    new_indexes_data_labels = concat(
        exploration_manager.data.unlabeled.index,
        exploration_manager.data.unlabeled.data,
        predictions,
    )
    old_indexes_data_labels = concat(
        exploration_manager.data.labeled.index,
        exploration_manager.data.labeled.data,
        exploration_manager.data.labeled_set.labels,
    )
    all_indexes_data_labels = np.vstack(
        (new_indexes_data_labels, old_indexes_data_labels)
    )

    response = []
    for row in all_indexes_data_labels[all_indexes_data_labels[:, 0].argsort()]:
        response.append(
            {
                "dataPoint": {"id": int(row[0]), "data": {"array": row[1:-1].tolist()}},
                "label": "POSITIVE" if row[-1] == 1 else "NEGATIVE",
            }
        )

    return jsonify(response)

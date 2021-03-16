import csv

from flask import Blueprint, jsonify, send_file
from flask_cors import cross_origin

from .endpoints import PREDICTIONS, POLYTOPE_PREDICTIONS, LABELED_DATASET
from ..utils import (
    get_labeled_dataset_path,
)
from ..cache import cache

bp = Blueprint("predictions", __name__)


def predict(with_polytope=False):
    exploration_manager = cache.get("exploration_manager")

    if with_polytope:
        all_labels = exploration_manager.data.predict_user_labels(
            exploration_manager.active_learner.polytope_model
        )
        label_types = {0: "NEGATIVE", 0.5: "UNKNOWN", 1: "POSITIVE"}
    else:
        all_labels = exploration_manager.compute_user_labels_prediction()
        label_types = {0: "NEGATIVE", 1: "POSITIVE"}

    response = [
        {
            "id": int(idx),
            "label": label_types[label],
        }
        for (idx, label) in zip(all_labels.index, all_labels.labels)
    ]
    response.sort(key=lambda x: x["id"])
    return jsonify(response)


@bp.route(PREDICTIONS, methods=["GET"])
@cross_origin(supports_credentials=True)
def learner_predict():
    return predict()


@bp.route(POLYTOPE_PREDICTIONS, methods=["GET"])
@cross_origin(supports_credentials=True)
def polytope_predict():
    return predict(with_polytope=True)


@bp.route(LABELED_DATASET, methods=["GET"])
@cross_origin(supports_credentials=True)
def download_labeled_dataset():
    separator = cache.get("separator")
    exploration_manager = cache.get("exploration_manager")

    all_labels = exploration_manager.compute_user_labels_prediction()

    labeled_dataset_path = get_labeled_dataset_path()

    with open(labeled_dataset_path, "w") as output:
        writer = csv.writer(output, delimiter=separator)

        for idx in all_labels.index.argsort():
            writer.writerow(
                [int(all_labels.index[idx])] + [int(all_labels.labels[idx])]
            )

        output.close()

    return send_file(
        labeled_dataset_path,
        as_attachment=True,
    )

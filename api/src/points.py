from flask import Blueprint, request
from .endpoints import UNLABELED_POINTS
import pandas as pd
from aideme.explore import PartitionedDataset, ExplorationManager
from aideme.active_learning import ActiveLearner

bp = Blueprint("initial points", __name__, url_prefix=UNLABELED_POINTS)


@bp.route("", methods=["POST"])
def get_points_to_label():
    configuration = request.form["configuration"]
    column_ids = request.form["columnIds"]

    full_dataset = pd.read_csv("filepath", sep=",")  # TODO

    data = PartitionedDataset(full_dataset.iloc[:, column_ids].to_numpy())
    active_leaner = configuration["activeLearner"]  # TODO
    subsampling = configuration["subsampleSize"]

    manager = ExplorationManager(data, active_leaner, subsampling)

    return manager.get_next_to_label()

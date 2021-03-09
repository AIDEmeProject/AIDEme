import json
import dill
import pandas as pd

from flask import Blueprint, session, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import LabeledSet, PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel

from .endpoints import INITIAL_UNLABELED_POINTS, NEXT_UNLABELED_POINTS
from ..db import db_client
from ..utils import get_dataset_path, is_session_expired, SESSION_EXPIRED_MESSAGE


bp = Blueprint("points to label", __name__)


def compute_partition_in_new_indexes(column_ids, column_names, partition_in_names):
    unique_column_ids = sorted(list(set(column_ids)))
    new_column_ids = [
        unique_column_ids.index(original_index) for original_index in column_ids
    ]

    name_to_new_index = {
        name: new_index for name, new_index in zip(column_names, new_column_ids)
    }

    partition = [
        [name_to_new_index[name] for name in group] for group in partition_in_names
    ]

    return partition, unique_column_ids


def format_points_to_label(points, partition=None):
    return [
        {
            "id": int(original_idx),
            "data": {
                "array": points.data[current_idx].tolist()
                if partition is None
                else points.data[current_idx][
                    [num for group in partition for num in group]
                ].tolist()
            },
        }
        for current_idx, original_idx in enumerate(points.index)
    ]


@bp.route(INITIAL_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    session_id = session["session_id"]

    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])

    if configuration["activeLearner"]["name"] == "SimpleMargin":
        learner = configuration["activeLearner"]["svmLearner"]
        active_learner = SimpleMargin(
            C=learner["C"],
            kernel=learner["kernel"]["name"]
            if learner["kernel"]["name"] != "gaussian"
            else "rbf",
            gamma=learner["kernel"]["gamma"]
            if learner["kernel"]["gamma"] > 0
            else "auto",
        )
    else:
        learner = configuration["activeLearner"]["learner"]
        active_learner = KernelVersionSpace(
            n_samples=learner["sampleSize"],
            add_intercept=learner["versionSpace"]["addIntercept"],
            cache_samples=learner["versionSpace"]["hitAndRunSampler"]["cache"],
            rounding=learner["versionSpace"]["hitAndRunSampler"]["rounding"],
            thin=learner["versionSpace"]["hitAndRunSampler"]["selector"]["thin"],
            warmup=learner["versionSpace"]["hitAndRunSampler"]["selector"]["warmUp"],
            kernel=learner["versionSpace"]["kernel"]["name"]
            if learner["versionSpace"]["kernel"]["name"] != "gaussian"
            else "rbf",
        )

    if "multiTSM" in configuration:
        partition, unique_column_ids = compute_partition_in_new_indexes(
            column_ids,
            configuration["multiTSM"]["columns"],
            configuration["multiTSM"]["featureGroups"],
        )
        active_learner = FactorizedDualSpaceModel(
            active_learner,
            partition=partition,
            sample_unknown_proba=configuration["multiTSM"][
                "searchUnknownRegionProbability"
            ],
            mode=[
                "categorical" if flag[1] else "persist"
                for flag in configuration["multiTSM"]["flags"]
            ],
        )
    else:
        unique_column_ids = column_ids
        partition = None

    dataset = pd.read_csv(
        get_dataset_path(session_id),
        db_client.hget(session_id, "separator").decode("utf-8"),
        usecols=unique_column_ids,
    ).to_numpy()
    # TODO: normalize, categorical columns, null values

    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )

    db_client.hset(session_id, "exploration_manager", dill.dumps(exploration_manager))

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(format_points_to_label(next_points_to_label, partition))


@bp.route(NEXT_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_next_points_to_label():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    session_id = session["session_id"]

    labeled_points = json.loads(request.form["labeledPoints"])
    exploration_manager = dill.loads(db_client.hget(session_id, "exploration_manager"))

    exploration_manager.update(
        LabeledSet(
            [point["label"] for point in labeled_points],
            index=[point["id"] for point in labeled_points],
        )
    )

    db_client.hset(session_id, "exploration_manager", dill.dumps(exploration_manager))

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(format_points_to_label(next_points_to_label))

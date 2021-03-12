import json
import dill
import pandas as pd
import numpy as np

from flask import Blueprint, session, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import LabeledSet, PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.version_space import (
    SubspatialSimpleMargin,
    SubspatialVersionSpace,
)

from .endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from ..db import db_client
from ..utils import get_dataset_path, is_session_expired, SESSION_EXPIRED_MESSAGE


bp = Blueprint("points to label", __name__)


def extract_simple_margin_params(learner_config):
    return {
        "type": "SimpleMargin",
        "C": learner_config["C"],
        "kernel": learner_config["kernel"]["name"]
        if learner_config["kernel"]["name"] != "gaussian"
        else "rbf",
        "gamma": learner_config["kernel"]["gamma"]
        if learner_config["kernel"]["gamma"] > 0
        else "auto",
    }


def extract_version_space_params(learner_config):
    return {
        "type": "VersionSpace",
        "n_samples": learner_config["sampleSize"],
        "add_intercept": learner_config["versionSpace"]["addIntercept"],
        "cache_samples": learner_config["versionSpace"]["hitAndRunSampler"]["cache"],
        "rounding": learner_config["versionSpace"]["hitAndRunSampler"]["rounding"],
        "thin": learner_config["versionSpace"]["hitAndRunSampler"]["selector"]["thin"],
        "warmup": learner_config["versionSpace"]["hitAndRunSampler"]["selector"][
            "warmUp"
        ],
        "kernel": learner_config["versionSpace"]["kernel"]["name"]
        if learner_config["versionSpace"]["kernel"]["name"] != "gaussian"
        else "rbf",
    }


def create_active_learner(params):
    if params["type"] == "SimpleMargin":
        return SimpleMargin(
            C=params["C"],
            kernel=params["kernel"],
            gamma=params["gamma"],
        )

    return KernelVersionSpace(
        n_samples=params["n_samples"],
        add_intercept=params["add_intercept"],
        cache_samples=params["cache_samples"],
        rounding=params["rounding"],
        thin=params["thin"],
        warmup=params["warmup"],
        kernel=params["kernel"],
    )


def create_factorized_active_learner(params, partition):
    if params["type"] == "SimpleMargin":
        return SubspatialSimpleMargin(
            partition,
            C=params["C"],
            kernel=params["kernel"],
            gamma=params["gamma"],
        )

    return SubspatialVersionSpace(
        partition,
        n_samples=params["n_samples"],
        add_intercept=params["add_intercept"],
        cache_samples=params["cache_samples"],
        rounding=params["rounding"],
        thin=params["thin"],
        warmup=params["warmup"],
        kernel=params["kernel"],
    )


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
        active_learner_params = extract_simple_margin_params(
            configuration["activeLearner"]["svmLearner"]
        )
    else:
        active_learner_params = extract_version_space_params(
            configuration["activeLearner"]["learner"]
        )

    is_tsm = "multiTSM" in configuration
    if is_tsm:
        partition, unique_column_ids = compute_partition_in_new_indexes(
            column_ids,
            configuration["multiTSM"]["columns"],
            configuration["multiTSM"]["featureGroups"],
        )
        active_learner = create_factorized_active_learner(
            active_learner_params, partition
        )
    else:
        unique_column_ids = column_ids
        partition = None
        active_learner = create_active_learner(active_learner_params)

    dataset = pd.read_csv(
        get_dataset_path(session_id),
        db_client.hget(session_id, "separator").decode("utf-8"),
        usecols=unique_column_ids,
    ).to_numpy()
    # TODO: normalize, categorical columns, null values

    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        active_learner=active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )

    db_client.hset(session_id, "exploration_manager", dill.dumps(exploration_manager))
    if is_tsm:
        db_client.hset(session_id, "partition", dill.dumps(partition))

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

    if "labels" in labeled_points[0]:
        exploration_manager.update(
            LabeledSet(
                labels=[np.prod(point["labels"]) for point in labeled_points],
                partial=[point["labels"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )
        partition = dill.loads(db_client.hget(session_id, "partition"))
    else:
        exploration_manager.update(
            LabeledSet(
                labels=[point["label"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )
        partition = None

    db_client.hset(session_id, "exploration_manager", dill.dumps(exploration_manager))

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(
        format_points_to_label(
            next_points_to_label,
            partition,
        )
    )

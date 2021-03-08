import json
import dill
import pandas as pd
import numpy as np

from flask import Blueprint, session, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import LabeledSet, PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel

from .endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from ..db import db_client
from ..utils import get_dataset_path, is_session_expired, SESSION_EXPIRED_MESSAGE


bp = Blueprint("points to label", __name__)


def create_simple_margin(params):
    return SimpleMargin(
        C=params["C"],
        kernel=params["kernel"]["name"]
        if params["kernel"]["name"] != "gaussian"
        else "rbf",
        gamma=params["kernel"]["gamma"] if params["kernel"]["gamma"] > 0 else "auto",
    )


def create_kernel_version_space(params):
    return KernelVersionSpace(
        n_samples=params["sampleSize"],
        add_intercept=params["versionSpace"]["addIntercept"],
        cache_samples=params["versionSpace"]["hitAndRunSampler"]["cache"],
        rounding=params["versionSpace"]["hitAndRunSampler"]["rounding"],
        thin=params["versionSpace"]["hitAndRunSampler"]["selector"]["thin"],
        warmup=params["versionSpace"]["hitAndRunSampler"]["selector"]["warmUp"],
        kernel=params["versionSpace"]["kernel"]["name"]
        if params["versionSpace"]["kernel"]["name"] != "gaussian"
        else "rbf",
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


def save_factorized_active_learner(
    session_id, active_learner, sample_unknown_proba, partition, mode
):
    factorization_params = {
        "sample_unknown_proba": sample_unknown_proba,
        "partition": partition,
        "mode": mode,
    }

    db_client.hset(session_id, "active_learner", dill.dumps(active_learner))
    db_client.hset(session_id, "factorization", dill.dumps(factorization_params))


def save_exploration_manager(
    session_id, exploration_manager, without_active_learner=False
):

    if without_active_learner:
        active_learner = exploration_manager.active_learner
        exploration_manager.active_learner = None
        db_client.hset(
            session_id, "exploration_manager", dill.dumps(exploration_manager)
        )
        exploration_manager.active_learner = active_learner
    else:
        db_client.hset(
            session_id, "exploration_manager", dill.dumps(exploration_manager)
        )


def load_exploration_manager(session_id, with_separate_active_learner=False):
    exploration_manager = dill.loads(db_client.hget(session_id, "exploration_manager"))

    if with_separate_active_learner:
        active_learner = dill.loads(db_client.hget(session_id, "active_learner"))
        factorization_params = dill.loads(db_client.hget(session_id, "factorization"))

        exploration_manager.active_learner = FactorizedDualSpaceModel(
            active_learner,
            sample_unknown_proba=factorization_params["sample_unknown_proba"],
            partition=factorization_params["partition"],
            mode=factorization_params["mode"],
        )

    return exploration_manager


@bp.route(INITIAL_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    session_id = session["session_id"]

    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])

    if configuration["activeLearner"]["name"] == "SimpleMargin":
        active_learner = create_simple_margin(
            configuration["activeLearner"]["svmLearner"]
        )
    else:
        active_learner = create_kernel_version_space(
            configuration["activeLearner"]["learner"]
        )

    is_tsm = "multiTSM" in configuration

    if is_tsm:
        partition, unique_column_ids = compute_partition_in_new_indexes(
            column_ids,
            configuration["multiTSM"]["columns"],
            configuration["multiTSM"]["featureGroups"],
        )
        sample_unknown_proba = configuration["multiTSM"][
            "searchUnknownRegionProbability"
        ]
        mode = [
            "categorical" if flag[1] else "persist"
            for flag in configuration["multiTSM"]["flags"]
        ]
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
        active_learner=FactorizedDualSpaceModel(
            active_learner,
            sample_unknown_proba,
            partition,
            mode,
        )
        if is_tsm
        else active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )

    if is_tsm:
        save_factorized_active_learner(
            session_id, active_learner, sample_unknown_proba, partition, mode
        )
        save_exploration_manager(
            session_id, exploration_manager, without_active_learner=True
        )
    else:
        save_exploration_manager(session_id, exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(format_points_to_label(next_points_to_label, partition))


@bp.route(NEXT_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_next_points_to_label():
    if is_session_expired(session):
        return SESSION_EXPIRED_MESSAGE

    session_id = session["session_id"]

    labeled_points = json.loads(request.form["labeledPoints"])

    is_tsm = "labels" in labeled_points[0]

    exploration_manager = load_exploration_manager(
        session_id, with_separate_active_learner=is_tsm
    )

    if is_tsm:
        exploration_manager.update(
            LabeledSet(
                labels=[np.prod(point["labels"]) for point in labeled_points],
                partial=[point["labels"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )
        partition = exploration_manager.active_learner.polytope_model.partition
    else:
        exploration_manager.update(
            LabeledSet(
                labels=[point["label"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )
        partition = None

    save_exploration_manager(
        session_id, exploration_manager, without_active_learner=is_tsm
    )

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(
        format_points_to_label(
            next_points_to_label,
            partition,
        )
    )

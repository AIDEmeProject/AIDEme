import json
import pandas as pd
import numpy as np

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import LabeledSet, PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.active_learning.version_space import SubspatialVersionSpace


from .endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from ..cache import cache
from ..utils import get_dataset_path


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


@bp.route(INITIAL_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])

    use_simple_margin = configuration["activeLearner"]["name"] == "SimpleMargin"

    if use_simple_margin:
        active_learner_params = extract_simple_margin_params(
            configuration["activeLearner"]["svmLearner"]
        )

    else:
        active_learner_params = extract_version_space_params(
            configuration["activeLearner"]["learner"]
        )

    with_factorization = "multiTSM" in configuration

    if with_factorization:
        partition, unique_column_ids = compute_partition_in_new_indexes(
            column_ids,
            configuration["multiTSM"]["columns"],
            configuration["multiTSM"]["featureGroups"],
        )
        if use_simple_margin:
            sample_unknown_proba = configuration["multiTSM"][
                "searchUnknownRegionProbability"
            ]
            mode = [
                "categorical" if flag[1] else "persist"
                for flag in configuration["multiTSM"]["flags"]
            ]
            active_learner = FactorizedDualSpaceModel(
                create_active_learner(active_learner_params),
                sample_unknown_proba,
                partition,
                mode,
            )
        else:
            active_learner = SubspatialVersionSpace(
                partition,
                n_samples=active_learner_params["n_samples"],
                add_intercept=active_learner_params["add_intercept"],
                cache_samples=active_learner_params["cache_samples"],
                rounding=active_learner_params["rounding"],
                thin=active_learner_params["thin"],
                warmup=active_learner_params["warmup"],
                kernel=active_learner_params["kernel"],
            )
    else:
        unique_column_ids = column_ids
        partition = None
        active_learner = create_active_learner(active_learner_params)

    dataset = pd.read_csv(
        get_dataset_path(),
        cache.get("separator"),
        usecols=unique_column_ids,
    ).to_numpy()
    # TODO: normalize, categorical columns

    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset, copy=False),
        active_learner=active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )

    cache.set("exploration_manager", exploration_manager)
    if with_factorization:
        cache.set("partition", partition)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())


@bp.route(NEXT_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_next_points_to_label():
    labeled_points = json.loads(request.form["labeledPoints"])

    with_factorization = "labels" in labeled_points[0]

    exploration_manager = cache.get("exploration_manager")

    if with_factorization:
        exploration_manager.update(
            LabeledSet(
                labels=[np.prod(point["labels"]) for point in labeled_points],
                partial=[point["labels"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )
    else:
        exploration_manager.update(
            LabeledSet(
                labels=[point["label"] for point in labeled_points],
                index=[point["id"] for point in labeled_points],
            )
        )

    cache.set("exploration_manager", exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())

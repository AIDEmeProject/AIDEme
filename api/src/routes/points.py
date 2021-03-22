import json
import pandas as pd

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace
from aideme.active_learning.dsm import FactorizedDualSpaceModel
from aideme.active_learning.version_space import SubspatialVersionSpace


from .endpoints import (
    INITIAL_UNLABELED_POINTS,
    NEXT_UNLABELED_POINTS,
)
from ..cache import cache
from ..utils import get_dataset_path, create_labeled_set


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


def encode_and_normalize(filepath, separator, column_ids):
    dataset = pd.read_csv(
        filepath,
        separator,
        usecols=column_ids,
    )
    dataset.columns = [str(idx) for idx in range(len(column_ids))]

    dataset = pd.get_dummies(dataset, drop_first=True)
    return dataset.apply(lambda x: (x - x.mean()) / x.std() if x.std() != 0 else x)


def compute_indexes_mapping(column_ids, new_column_names):
    indexes_mapping = {}
    for idx in column_ids:
        indexes_mapping[idx] = [
            new_idx
            for new_idx, name in enumerate(new_column_names)
            if name.startswith(str(idx))
        ]
    return indexes_mapping


def compute_partition_in_encoded_indexes(partition, indexes_mapping):
    new_partition = []
    for group in partition:
        new_group = []
        for idx in group:
            new_group += indexes_mapping[idx]
        new_partition.append(new_group)
    return new_partition


def create_exploration_manager(
    dataset_path, separator, column_ids, configuration, encode=True
):
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
    else:
        unique_column_ids = column_ids
        partition = None

    if encode:
        transformed_dataset = encode_and_normalize(
            dataset_path, separator, unique_column_ids
        )
        if with_factorization:
            indexes_mapping = compute_indexes_mapping(
                list(range(len(unique_column_ids))), transformed_dataset.columns
            )
            new_partition = compute_partition_in_encoded_indexes(
                partition, indexes_mapping
            )
        else:
            new_partition = partition
    else:
        transformed_dataset = pd.read_csv(
            dataset_path,
            separator,
            usecols=unique_column_ids,
        )
        new_partition = partition

    if with_factorization:
        if use_simple_margin:
            active_learner = FactorizedDualSpaceModel(
                create_active_learner(active_learner_params),
                sample_unknown_proba,
                new_partition,
                mode,
            )
        else:
            active_learner = SubspatialVersionSpace(
                new_partition,
                n_samples=active_learner_params["n_samples"],
                add_intercept=active_learner_params["add_intercept"],
                cache_samples=active_learner_params["cache_samples"],
                rounding=active_learner_params["rounding"],
                thin=active_learner_params["thin"],
                warmup=active_learner_params["warmup"],
                kernel=active_learner_params["kernel"],
            )
    else:
        active_learner = create_active_learner(active_learner_params)

    return ExplorationManager(
        PartitionedDataset(
            transformed_dataset.to_numpy(),
            copy=False,
        ),
        active_learner=active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )


@bp.route(INITIAL_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])

    separator = cache.get("separator")

    exploration_manager = create_exploration_manager(
        get_dataset_path(), separator, column_ids, configuration
    )

    cache.set("exploration_manager", exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())


@bp.route(NEXT_UNLABELED_POINTS, methods=["POST"])
@cross_origin(supports_credentials=True)
def get_next_points_to_label():
    labeled_points = json.loads(request.form["labeledPoints"])

    exploration_manager = cache.get("exploration_manager")
    exploration_manager.update(create_labeled_set(labeled_points))
    cache.set("exploration_manager", exploration_manager)

    next_points_to_label = exploration_manager.get_next_to_label()
    return jsonify(next_points_to_label.index.tolist())

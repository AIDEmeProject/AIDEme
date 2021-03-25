import pandas as pd
import numpy as np

from aideme.initial_sampling import random_sampler
from aideme.explore import PartitionedDataset, ExplorationManager
import aideme.active_learning
from aideme.active_learning import (
    ActiveLearner,
    FactorizedActiveLearner,
)


def decode_active_learner(config, factorization_info) -> ActiveLearner:
    active_learner_class = getattr(aideme.active_learning, config["name"])

    # decode nester Tag values in params
    params = config.get("params", {})
    new_params = {}
    for key, value in params.items():
        if isinstance(value, dict) and "name" in value:
            new_params[key] = decode_active_learner(value, factorization_info)
        else:
            new_params[key] = value

    active_learner = active_learner_class(**new_params)

    if isinstance(active_learner, FactorizedActiveLearner):
        active_learner.set_factorization_structure(**factorization_info)

    return active_learner


def compute_partition_in_new_indexes(partition):
    unique_column_ids = sorted(list(set(i for group in partition for i in group)))
    old_to_new_index = {
        old_idx: new_idx for (new_idx, old_idx) in enumerate(unique_column_ids)
    }

    partition_in_new_indexes = [
        [old_to_new_index[i] for i in group] for group in partition
    ]

    return partition_in_new_indexes, unique_column_ids


def encode_and_normalize(dataset):
    dataset.columns = [str(idx) for idx in range(len(dataset.columns))]
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


def compute_mode(partition, types):
    return [
        "persist"
        if np.any([types[column_id] in [np.int64, np.float64] for column_id in group])
        else "categorical"
        for group in partition
    ]


def create_exploration_manager(
    dataset_path,
    separator,
    column_ids,
    configuration,
    encode=True,
    precomputed_mode=False,
):

    with_factorization = "factorization" in configuration

    if with_factorization:
        partition, unique_column_ids = compute_partition_in_new_indexes(
            configuration["factorization"]["partition"]
        )
    else:
        partition = None
        unique_column_ids = column_ids

    dataset = pd.read_csv(
        dataset_path,
        separator,
        usecols=unique_column_ids,
    )

    if with_factorization:
        if precomputed_mode:
            mode = configuration["factorization"]["mode"]
        else:
            mode = compute_mode(partition, dataset.dtypes)

    if encode:
        dataset = encode_and_normalize(dataset)
        if with_factorization:
            indexes_mapping = compute_indexes_mapping(
                list(range(len(unique_column_ids))), dataset.columns
            )
            partition = compute_partition_in_encoded_indexes(partition, indexes_mapping)

    if with_factorization:
        factorization_info = {"partition": partition, "mode": mode}
    else:
        factorization_info = {}

    active_learner = decode_active_learner(
        configuration["activeLearner"], factorization_info
    )

    return ExplorationManager(
        PartitionedDataset(
            dataset.to_numpy(),
            copy=False,
        ),
        active_learner=active_learner,
        subsampling=configuration["subsampling"],
        initial_sampler=random_sampler(sample_size=3),
    )

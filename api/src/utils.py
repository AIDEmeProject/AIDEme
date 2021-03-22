import os

import numpy as np

from aideme.explore import LabeledSet

from .config.general import (
    UPLOAD_FOLDER,
    DATASET_FILE,
    LABELED_DATASET_FILE,
    TRACE_FOLDER,
)


def get_dataset_path():
    return os.path.join(UPLOAD_FOLDER, DATASET_FILE)


def get_labeled_dataset_path():
    return os.path.join(UPLOAD_FOLDER, LABELED_DATASET_FILE)


def get_trace_dataset_path(filename):
    return os.path.join(TRACE_FOLDER, filename)


def create_labeled_set(labeled_points):
    if "labels" in labeled_points[0]:
        return LabeledSet(
            labels=[np.prod(point["labels"]) for point in labeled_points],
            partial=[point["labels"] for point in labeled_points],
            index=[point["id"] for point in labeled_points],
        )

    return LabeledSet(
        labels=[point["label"] for point in labeled_points],
        index=[point["id"] for point in labeled_points],
    )

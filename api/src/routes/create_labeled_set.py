import numpy as np

from aideme.explore import LabeledSet


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

import os
import json

import src.routes.points
from src.routes.endpoints import INITIAL_UNLABELED_POINTS

from tests.utils import MockStorageManager


simple_margin_configuration = {
    "activeLearner": {
        "name": "SimpleMargin",
        "svmLearner": {
            "C": 1024,
            "kernel": {"gamma": 0, "name": "gaussian"},
            "name": "SVM",
        },
    },
    "subsampleSize": 50000,
    "useFactorizationInformation": False,
}

version_space_configuration = {
    "activeLearner": {
        "learner": {
            "name": "MajorityVote",
            "sampleSize": 8,
            "versionSpace": {
                "addIntercept": True,
                "hitAndRunSampler": {
                    "cache": True,
                    "rounding": True,
                    "selector": {"name": "WarmUpAndThin", "thin": 10, "warmUp": 100},
                },
                "kernel": {"name": "gaussian"},
                "solver": "ojalgo",
            },
        },
        "name": "UncertaintySampler",
    },
    "subsampleSize": 50000,
    "task": "sdss_Q4_0.1%",
}

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_small.csv"
)


def test_get_initial_points_to_label(client, monkeypatch):
    monkeypatch.setattr(src.routes.points, "storage_manager", MockStorageManager())
    monkeypatch.setattr(src.routes.points, "session", {"session_id": "random"})
    monkeypatch.setattr(
        src.routes.points,
        "get_dataset_path",
        lambda x: TEST_DATASET_PATH,
    )

    response = client.post(
        INITIAL_UNLABELED_POINTS,
        data={
            "configuration": json.dumps(simple_margin_configuration),
            "columnIds": json.dumps([1, 3]),
        },
    )
    points_to_label = json.loads(response.data)

    assert isinstance(points_to_label, list)
    assert len(points_to_label) == 3
    assert {"id", "data"} <= points_to_label[0].keys()
    assert "array" in points_to_label[0]["data"]
    assert len(points_to_label[0]["data"]["array"]) == 2

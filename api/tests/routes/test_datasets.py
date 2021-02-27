import os
import shutil
import json
import flask

import src.routes.datasets
from src.routes.endpoints import DATASETS
from src.config.general import UPLOAD_FOLDER

from tests.utils import MockStorageManager

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_small.csv"
)


def test_create_session(client, monkeypatch):
    with client:
        monkeypatch.setattr(
            src.routes.datasets, "storage_manager", MockStorageManager()
        )

        response = client.post(
            DATASETS,
            content_type="multipart/form-data",
            data={"dataset": open(TEST_DATASET_PATH, "rb"), "separator": ","},
        )
        assert json.loads(response.data) == {
            "columns": ["id", "age", "sex", "indice_glycemique"],
            "maximums": [0, 0, 0, 0],
            "uniqueValueNumbers": [5, 5, 2, 3],
            "hasFloats": [False, False, False, True],
        }

        assert "session_id" in flask.session

        shutil.rmtree(UPLOAD_FOLDER)

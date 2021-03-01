import os
import shutil
import json

import flask

import src.routes.datasets
from src.routes.endpoints import DATASETS
from src.utils import get_session_path

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_small.csv"
)


def test_create_session(client, monkeypatch):
    with client:
        monkeypatch.setattr(src.routes.datasets.db_client, "delete", lambda key: None)
        monkeypatch.setattr(
            src.routes.datasets.db_client, "hset", lambda key, field, value: None
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
        session_upload_folder = get_session_path(flask.session["session_id"])
        assert os.path.isdir(session_upload_folder)

        shutil.rmtree(session_upload_folder)

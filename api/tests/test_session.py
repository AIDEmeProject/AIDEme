import os
import shutil
import json
import flask

from src.endpoints import SESSION


def test_session(client):
    with client as c:
        filepath = os.path.join(os.path.dirname(__file__), "dataset.csv")
        response = c.post(
            SESSION,
            content_type="multipart/form-data",
            data={"dataset": open(filepath, "rb"), "separator": ","},
        )
        assert json.loads(response.data) == {
            "columns": ["id", "age", "sex", "indice_glycemique"],
            "maximums": [0, 0, 0, 0],
            "uniqueValueNumbers": [5, 5, 2, 3],
            "hasFloats": [False, False, False, True],
        }

        assert "session_id" in flask.session
        assert flask.session["separator"] == ","

        api_dir = os.path.dirname(__file__).split(sep="tests")[0]
        shutil.rmtree(os.path.join(api_dir, "session"))

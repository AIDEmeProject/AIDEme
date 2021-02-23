import os
import json
from src.endpoints import SESSION


def test_session(client):
    filepath = os.path.join(os.path.dirname(__file__), "dataset.csv")
    response = client.post(
        SESSION,
        content_type="multipart/form-data",
        data={"dataset": open(filepath, "rb"), "separator": ","},
    )
    assert json.loads(response.data) == {
        "columns": ["id", "age", "sex", "indice_glycemique"],
        "maximums": [0, 0, 0, 0],
        # "maximums": [4.0, 33.0, 1.0, 1.0],
        # "minimums": [0.0, 8.0, 0.0, 0.5],
        "uniqueValueNumbers": [5, 5, 2, 3],
        "hasFloats": [False, False, False, True],
        # "nRows": 5,
    }

import os
import shutil
import json

from src.routes.endpoints import DATASETS
from src.config.general import UPLOAD_FOLDER

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_small.csv"
)


def test_create_session(client):
    with client:
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
        assert os.path.isdir(UPLOAD_FOLDER)

        shutil.rmtree(UPLOAD_FOLDER)

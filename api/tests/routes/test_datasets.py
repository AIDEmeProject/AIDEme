import os
import shutil
import json

from src.routes.endpoints import DATASETS
from src.config.general import UPLOAD_FOLDER

TEST_DATASET_PATH = os.path.join(
    __file__.split(sep="tests")[0], "tests", "data", "numeric_medium.csv"
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
            "types": ["numerical", "numerical", "categorical", "numerical"],
        }
        assert os.path.isdir(UPLOAD_FOLDER)

        shutil.rmtree(UPLOAD_FOLDER)

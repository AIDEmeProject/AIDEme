import os
import shutil
import json

from src.routes.endpoints import DATASETS
from src.config.general import UPLOAD_FOLDER


def get_test_dataset_path(filename):
    return os.path.join(__file__.split(sep="tests")[0], "tests", "data", filename)


def test_handle_dataset_with_null(client):
    response = client.post(
        DATASETS,
        content_type="multipart/form-data",
        data={
            "dataset": open(get_test_dataset_path("numeric_medium_null.csv"), "rb"),
            "separator": ",",
        },
    )

    assert json.loads(response.data) == {
        "error": "Please upload a dataset without missing values.",
    }
    assert os.path.isdir(UPLOAD_FOLDER)

    shutil.rmtree(UPLOAD_FOLDER)


def test_create_session(client):
    response = client.post(
        DATASETS,
        content_type="multipart/form-data",
        data={
            "dataset": open(get_test_dataset_path("numeric_medium.csv"), "rb"),
            "separator": ",",
        },
    )

    assert json.loads(response.data) == {
        "columns": ["id", "age", "sex", "indice_glycemique"],
        "types": ["numerical", "numerical", "categorical", "numerical"],
    }
    assert os.path.isdir(UPLOAD_FOLDER)

    shutil.rmtree(UPLOAD_FOLDER)

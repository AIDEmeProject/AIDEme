#  Copyright 2019 École Polytechnique
#
#  Authorship
#    Luciano Di Palma <luciano.di-palma@polytechnique.edu>
#    Enhui Huang <enhui.huang@polytechnique.edu>
#    Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
#    Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
#
#  Disclaimer
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
#    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
#    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
#    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
#    IN THE SOFTWARE.

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

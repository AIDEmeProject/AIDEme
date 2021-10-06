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
import numpy as np
import pandas as pd

from flask import Blueprint, request
from flask_cors import cross_origin

from .endpoints import DATASETS
from ..config.general import MAX_UNIQUE_VALUES
from ..cache import cache
from ..utils import get_dataset_path

bp = Blueprint("datasets", __name__, url_prefix=DATASETS)


@bp.route("", methods=["POST"])
@cross_origin(supports_credentials=True)
def create_session():
    dataset = request.files["dataset"]
    separator = request.form["separator"]

    save_dataset(dataset, separator)

    return summarize_dataset(get_dataset_path(), separator)


def save_dataset(dataset, separator):
    filepath = get_dataset_path()
    dirpath = os.path.dirname(filepath)
    if not os.path.isdir(dirpath):
        os.mkdir(dirpath)

    dataset.save(filepath)

    cache.set("separator", separator)


def summarize_dataset(filepath, separator):
    engine = None if separator in [",", ";"] else "python"
    dataset = pd.read_csv(filepath, sep=separator, engine=engine)

    if dataset.isnull().sum().sum() > 0:
        return {"error": "Please upload a dataset without missing values."}

    is_object = dataset.apply(lambda x: x.dtype == object)
    is_int = dataset.apply(lambda x: x.dtype == np.int64)
    num_unique_values = dataset.apply(lambda x: len(x.unique()))
    displayed_as_categorical = is_object | (
        is_int & (num_unique_values <= min(MAX_UNIQUE_VALUES, 0.2 * len(dataset)))
    )

    return {
        "columns": dataset.columns.tolist(),
        "types": [
            "categorical" if value else "numerical"
            for value in displayed_as_categorical
        ],
    }

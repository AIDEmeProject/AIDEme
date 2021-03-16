import os
import numpy as np
import pandas as pd

from flask import Blueprint, request
from flask_cors import cross_origin

from .endpoints import DATASETS
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

    is_object = dataset.apply(lambda x: x.dtype == np.object)
    is_int = dataset.apply(lambda x: x.dtype == np.int64)
    num_unique_values = dataset.apply(lambda x: len(x.unique()))
    is_categorical = is_object | (is_int & (num_unique_values < 0.2 * len(dataset)))

    return {
        "columns": dataset.columns.tolist(),
        "types": ["categorical" if value else "numerical" for value in is_categorical],
    }

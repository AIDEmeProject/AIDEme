import os
import shutil
from flask import Blueprint, session, request
from flask_cors import cross_origin
import uuid
import numpy as np
import pandas as pd

from .endpoints import DATASETS
from ..utils import get_dataset_path

from ..db.access import save_field

bp = Blueprint("datasets", __name__, url_prefix=DATASETS)


@bp.route("", methods=["POST"])
@cross_origin(supports_credentials=True)
def create_session():
    if "session_id" in session:
        delete_dataset(get_dataset_path(session["session_id"]))

    session_id = str(uuid.uuid4())
    session["session_id"] = session_id

    dataset = request.files["dataset"]
    separator = request.form["separator"]

    upload_path = get_dataset_path(session_id)

    save_dataset(dataset, upload_path)
    save_field(session_id, "separator", separator)

    return summarize_dataset(upload_path, separator)


def delete_dataset(filepath):
    dirpath = os.path.dirname(filepath)
    if os.path.isdir(dirpath):
        shutil.rmtree(dirpath)


def save_dataset(file, filepath):
    dirpath = os.path.dirname(filepath)
    if not os.path.isdir(dirpath):
        os.mkdir(dirpath)

    file.save(filepath)
    # TODO catch error on save


def summarize_dataset(filepath, separator):
    dataset = pd.read_csv(filepath, sep=separator)
    return {
        "columns": dataset.columns.tolist(),
        "maximums": [0] * len(dataset.columns),
        # "maximums": dataset.max(axis=0).tolist(),
        "uniqueValueNumbers": dataset.apply(lambda x: len(x.unique())).tolist(),
        "hasFloats": dataset.apply(lambda x: x.dtype == np.float64).tolist(),
    }

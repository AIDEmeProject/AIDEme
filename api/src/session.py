import os
from flask import Blueprint, request, current_app
import numpy as np
import pandas as pd
from .config_ids import UPLOAD_FOLDER
from .config import SESSION_ID
from .endpoints import SESSION

bp = Blueprint("session", __name__, url_prefix=SESSION)


@bp.route("", methods=["POST"])
def create_session():
    dataset = request.files["dataset"]
    separator = request.form["separator"]

    upload_path = os.path.join(
        current_app.config[UPLOAD_FOLDER], SESSION_ID, "data.csv"
    )

    save_dataset(dataset, upload_path)

    return summarize_dataset(upload_path, separator)


def save_dataset(file, filepath):
    dirpath = os.path.dirname(filepath)
    if not os.path.isdir(dirpath):
        os.mkdir(dirpath)

    file.save(filepath)
    # TODO catch error on save


def summarize_dataset(filepath, separator):
    dataset = pd.read_csv(filepath, sep=separator)
    return {
        "columns": dataset.columns.to_list(),
        "maximums": dataset.max(axis=0).to_list(),
        "minimums": dataset.min(axis=0).to_list(),
        "uniqueValueNumbers": dataset.apply(lambda x: len(x.unique())).to_list(),
        "hasFloats": dataset.apply(lambda x: x.dtype == np.float64).to_list(),
        "nRows": len(dataset),
    }

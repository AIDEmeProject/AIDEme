import os
from flask import Blueprint, request, current_app
import numpy as np
import pandas as pd
from .config import UPLOAD_FOLDER
from .endpoints import SESSION

bp = Blueprint("session", __name__, url_prefix=SESSION)


@bp.route("", methods=["POST"])
def create_session():
    session_id = "42"
    # TODO generate session id

    dataset = request.files["dataset"]
    separator = request.form["separator"]

    session_upload_folder = os.path.join(current_app.config[UPLOAD_FOLDER], session_id)
    if not os.path.isdir(session_upload_folder):
        os.mkdir(session_upload_folder)

    upload_path = os.path.join(session_upload_folder, "data.csv")

    dataset.save(upload_path)
    # TODO catch error on save

    return get_csv_infos(upload_path, separator)


def get_csv_infos(filepath, separator):
    df = pd.read_csv(filepath, sep=separator)
    return {
        "columns": df.columns.to_list(),
        "maximums": df.max(axis=0).to_list(),
        "minimums": df.min(axis=0).to_list(),
        "uniqueValueNumbers": df.apply(lambda x: len(x.unique())).to_list(),
        "hasFloats": df.apply(lambda x: x.dtype == np.float64).to_list(),
        "nRows": len(df),
    }

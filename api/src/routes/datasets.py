import os
import shutil
import uuid
import numpy as np
import pandas as pd

from flask import Blueprint, session, request
from flask_cors import cross_origin

from .endpoints import DATASETS
from ..db import db_client
from ..utils import get_dataset_path, get_session_path
from ..config.general import SESSION_EXPIRY_TIME_IN_SECONDS

bp = Blueprint("datasets", __name__, url_prefix=DATASETS)


@bp.route("", methods=["POST"])
@cross_origin(supports_credentials=True)
def create_session():
    if "session_id" in session:
        delete_dataset(session["session_id"])

    session_id = str(uuid.uuid4())
    session["session_id"] = session_id

    dataset = request.files["dataset"]
    separator = request.form["separator"]

    save_dataset(session_id, dataset, separator)

    return summarize_dataset(get_dataset_path(session_id), separator)


def delete_dataset(session_id):
    dirpath = get_session_path(session_id)
    if os.path.isdir(dirpath):
        shutil.rmtree(dirpath)

    db_client.delete(session_id)


def save_dataset(session_id, dataset, separator):
    filepath = get_dataset_path(session_id)
    dirpath = os.path.dirname(filepath)
    if not os.path.isdir(dirpath):
        os.mkdir(dirpath)

    dataset.save(filepath)

    db_client.hset(session_id, "separator", separator)
    db_client.expire(session_id, SESSION_EXPIRY_TIME_IN_SECONDS)


def summarize_dataset(filepath, separator):
    engine = None if separator in [",", ";"] else "python"
    dataset = pd.read_csv(filepath, sep=separator, engine=engine)
    return {
        "columns": dataset.columns.tolist(),
        "maximums": [0] * len(dataset.columns),
        # "maximums": dataset.max(axis=0).tolist(),
        "uniqueValueNumbers": dataset.apply(lambda x: len(x.unique())).tolist(),
        "hasFloats": dataset.apply(lambda x: x.dtype == np.float64).tolist(),
    }

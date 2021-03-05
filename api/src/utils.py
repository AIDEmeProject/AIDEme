import os

from .config.general import UPLOAD_FOLDER, FILE_NAME
from .db import db_client

SESSION_EXPIRED_MESSAGE = {"errorMessage": "Session expired"}


def get_session_path(session_id):
    return os.path.join(UPLOAD_FOLDER, session_id)


def get_dataset_path(session_id):
    return os.path.join(get_session_path(session_id), FILE_NAME)


def is_session_expired(session):
    return ("session_id" not in session) or (
        db_client.exists(session["session_id"]) == 0
    )

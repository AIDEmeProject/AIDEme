import os

from .config.general import UPLOAD_FOLDER, FILE_NAME


def get_session_path(session_id):
    return os.path.join(UPLOAD_FOLDER, session_id)


def get_dataset_path(session_id):
    return os.path.join(get_session_path(session_id), FILE_NAME)

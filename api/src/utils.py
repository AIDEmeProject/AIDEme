import os

from .config.general import UPLOAD_FOLDER


def get_dataset_path(session_id):
    return os.path.join(UPLOAD_FOLDER, session_id, "data.csv")

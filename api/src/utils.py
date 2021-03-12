import os

from .config.general import UPLOAD_FOLDER, DATASET_FILE, LABELED_DATASET_FILE

SESSION_EXPIRED_MESSAGE = {"errorMessage": "Session expired"}


def get_dataset_path():
    return os.path.join(UPLOAD_FOLDER, DATASET_FILE)


def get_labeled_dataset_path():
    return os.path.join(UPLOAD_FOLDER, LABELED_DATASET_FILE)

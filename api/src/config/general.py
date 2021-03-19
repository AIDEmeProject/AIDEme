import os

UPLOAD_FOLDER = os.path.join(__file__.split(sep="api")[0], "api", "sessions")
DATASET_FILE = "data.csv"
LABELED_DATASET_FILE = "labeled_dataset.csv"

MAX_FILTERED_POINTS = 25

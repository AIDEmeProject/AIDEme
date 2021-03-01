import os

UPLOAD_FOLDER = os.path.join(__file__.split(sep="api")[0], "api", "sessions")
FILE_NAME = "data.csv"

SESSION_EXPIRY_TIME_IN_SECONDS = 2 * 24 * 60 * 60

REDIS_HOST = "localhost"
REDIS_PORT = 6379

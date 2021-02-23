import os

from flask import Flask, request
from flask_cors import CORS

from .config_ids import UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from . import session


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    CORS(app)

    app.config[UPLOAD_FOLDER] = "./session"
    app.config[MAX_CONTENT_LENGTH] = 90 * 1024 * 1024

    if not os.path.isdir(app.config[UPLOAD_FOLDER]):
        os.mkdir(app.config[UPLOAD_FOLDER])

    app.register_blueprint(session.bp)

    return app

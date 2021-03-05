import os

from flask import Flask, request
from flask_cors import CORS

from .config.general import UPLOAD_FOLDER
from .config import app_specific
from .routes import datasets, points, predictions


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(app_specific)
    CORS(app)

    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    app.register_blueprint(datasets.bp)
    app.register_blueprint(points.bp)
    app.register_blueprint(predictions.bp)

    return app

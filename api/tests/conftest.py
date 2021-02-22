import pytest
from src import create_app


@pytest.fixture
def app():
    # TODO remove upload folder before tests using shutil ?

    app = create_app()
    app.config["TESTING"] = True
    yield app


@pytest.fixture
def client(app):
    return app.test_client()

# AIDEme Backend

In this module, we implement the backend server for the AIDEme data exploration demo. 
The server functionality was done in Python using the Flask library.

Below, you can find more information on how to start the server and install all required dependencies.

## 1. Installation instructions

- **Python version**: 3.7+

- Install the [AIDEme](https://github.com/AIDEmeProject/AIDEme) package and other dependencies via:

```shell
pip install -r requirements/base.txt
```


## 2. Starting the server

1. Set environment variables

```shell
export FLASK_APP=src
export FLASK_ENV=development
```

2. Start Flask server

```
python -m flask run -h localhost -p 7060
```

## 3. Running tests
To run our unit test suite, simply open a terminal at the `api` folder and run:

```shell
pip install -r requirements/dev.txt
python -m pytest tests
```

End-to-end tests can also be run through the following commands:

```shell
python -m pytest tests/aideme/run_trace_dsm.py
python -m pytest tests/routes/run_trace.py
```

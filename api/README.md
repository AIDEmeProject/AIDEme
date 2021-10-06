# Backend Server

In this module, we implement the backend server for the AIDEme data exploration demo. 
The server functionality was done in Python using the Flask library.

Below, you can find more information on how to start the server and install all required dependencies.

## 1. Installation instructions

- **Python version**: 3.7+

- Install the [AIDEme](https://github.com/AIDEmeProject/AIDEme) package and other dependencies (e.g. Flask):

```
pip install git+https://github.com/AIDEmeProject/AIDEme.git
pip install -r requirements.txt
```


## 2. Starting the server

1. Set environment variables

```
export FLASK_APP=src
export FLASK_ENV=development
```

2. Start Flask server

```
python -m flask run -h localhost -p 7060
```

## 3. Running tests
To run our test suite, simply open a terminal at the `api` folder and run:

```
python -m pytest tests
```

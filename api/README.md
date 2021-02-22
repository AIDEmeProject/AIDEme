## Dev setup

### Prepare virtual environment

- Install Python 3.7+

- Create virtual environment

```
cd api
python -m venv venv
```

- Activate virtual environment

```
sourve venv/bin/activate
```

- Install packages in the activated virtual environment

```
pip install -r requirements.txt
```

- Install new packages

```
pip install new-package
```

Update `install_requires` or `extras_require`in `setup.py`

Update `requirements.txt`

```
pip freezze > requirements.txt
```

### Run web server in development

- Set environment variables once

```
export FLASK_APP=src
export FLASK_ENV=development
```

- Run web server in dev mode (auto reload + debug)

```
flask run
```

# <<<<<<< HEAD

Run with custom host and port

```
flask run -h localhost -p 3000
```

> > > > > > > create new session

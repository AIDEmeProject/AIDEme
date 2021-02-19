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

- Add new packages in requirements.txt and install them

```
pip install -r requirements.txt
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

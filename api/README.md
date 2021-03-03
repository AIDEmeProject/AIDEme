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

Install aideme

```
pip install git+ssh://git@gitlab.inria.fr/ldipalma/aideme.git
```

or

```
pip install https://gitlab.inria.fr/ldipalma/aideme/-/archive/master/aideme-master.tar.gz
```

Install other dependencies

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

- Update aideme

```
pip uninstall aideme
pip install git+ssh://git@gitlab.inria.fr/ldipalma/aideme.git
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

Run with custom host and port (to match with the existing frontend)

```
flask run -h localhost -p 7060
```

### Run tests

- Install the package in editable mode

```
cd api
pip install -e .
```

- Run all tests

```
cd api
pytest
```

- Run a specific test

```
cd api
pytest path/to/test_module.py
```

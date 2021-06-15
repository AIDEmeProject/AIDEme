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
pip install git+ssh://git@gitlab.inria.fr/aideme/aideme.git
```

or

```
pip install https://gitlab.inria.fr/aideme/aideme/-/archive/master/aideme-master.tar.gz
```

Install other dependencies

```
pip install -r requirements.txt
```

- Install new packages

```
pip install new-package
```

Update `install_requires` or `extras_require` in `setup.py`

Update `requirements.txt`

```
pip freeze > requirements.txt
```

- Update aideme

```
pip uninstall aideme
pip install git+ssh://git@gitlab.inria.fr/aideme/aideme.git
```

### Setup redis

- Download, compile from sources and test compilation (optional, may take a long time)

```
cd to/the/folder/to/contain/the/download/file
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis -stable.tar.gz
cd redis-stable
make
make test
```

- Copy redis-server and redis-cli (command line interface) to `/usr/local/bin/` for convenient use

```
make install
```

- For more information, see

  [https://redis.io/download](https://redis.io/download)

  [https://redis.io/topics/quickstart](https://redis.io/topics/quickstart)

- Start server (can be called from everywhere)

```
redis-server
```

- Open the command line interface (can be called from everywhere)

```
redis-cli
```

- For commands to use in redis command line interface, see
  [https://redis.io/commands](https://redis.io/commands)

- Shutdown server with data persistance

```
redis -cli shutdown
```

### Branches

- Demo branch: supports one user

This branch is up to date with the frontend.

```
git checkout demo
```

- Master branch: supports multiple users using cookies and redis

This branch is currently out of date and does not work with the current frontend.

```
git checkout master
```

### Run web server in development

- If the master branch is active, install redis and run redis server before running the web server.

- Set environment variables once

```
export FLASK_APP=src
export FLASK_ENV=development
```

- Run web server in dev mode (auto reload + debug) with custom host and port (to match with the existing frontend)

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

- Uninstall the current package installed in editable mode

```
cd api
pip uninstall aideme-web-api
```

### Code editing

- Linter: `pylint` (see `api/.pylintrc` for config)

- Formatter: `black` (use default config)

- Editor: config in `.vscode/settings.json` allows running linter and formater on save

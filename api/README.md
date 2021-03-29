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

Update `install_requires` or `extras_require` in `setup.py`

Update `requirements.txt`

```
pip freeze > requirements.txt
```

- Update aideme

```
pip uninstall aideme
pip install git+ssh://git@gitlab.inria.fr/ldipalma/aideme.git
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

- Master branch: supports one user

This branch is up to date with the frontend.

```
git checkout master
```

- Web branch: supports multiple users using cookies and redis

This branch is currently out of date and does not work with the current frontend.

```
git checkout web
```

### Run web server in development

- If the master branch is active, install redis and run redis server before running the web server.

- The virtual environment needs to be activated before running the web server.

```
source venv/bin/activate
```

- Set environment variables once (in a terminal window). In new terminal windows, set these environment variables again before running the web server.

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

- Run trace tests (trace tests take long time and thus are run separately when needed)

```
cd api
pytest tests/aidme/run_trace_dsm.py
pytest tests/routes/run_trace.py
```

- Uninstall the current package installed in editable mode

```
cd api
pip uninstall aideme-web-api
```

### Troubleshooting

If the frontend does not behave as expected, here are places to see in order to debug:

- The Console in the developer tools in the browser.

- The Network tab in the developer tools in the browser which shows the details of the requests and responses.

- The terminal window that runs the backend web server.

Some potential errors:

- When running

```
flask run -h localhost -p 7060
```

Error: Could not locate a Flask application. You did not provide the "FLASK_APP" environment variable, and a "wsgi.py" or "app.py" module was not found in the current directory.

==> Should set environment variables before running the server

```
export FLASK_APP=src
export FLASK_ENV=development
```

- The Console in the developer tools in the browser indicates a NETWORK ERROR, and the terminal window that runs the backend web server indicates some packages missing for import.

==> Should activate the virtual environment where the required packages have been installed before running the server.

### Code editing

- Linter: `pylint` (see `api/.pylintrc` for config)

- Formatter: `black` (use default config)

- Editor: config in `.vscode/settings.json` allows running linter and formater on save

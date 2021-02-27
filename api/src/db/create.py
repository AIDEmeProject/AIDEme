# Run the async storage before the app
# cd api/src/db
# python create.py

from multiprocessing.managers import BaseManager
from multiprocessing import Lock


# from src.config.general import ASYNC_STORAGE_ADDRESS, ASYNC_STORAGE_AUTHKEY

ASYNC_STORAGE_ADDRESS = ("", 50000)
ASYNC_STORAGE_AUTHKEY = b"password"

sessions = {}
lock = Lock()


def get_field(session_id, field):
    with lock:
        return sessions[session_id][field]


def set_field(session_id, field, value):
    if session_id not in sessions:
        sessions[session_id] = {}

    sessions[session_id][field] = value


def clear(session_id):
    del sessions[session_id]


manager = BaseManager(ASYNC_STORAGE_ADDRESS, ASYNC_STORAGE_AUTHKEY)

manager.register("get_field", get_field)
manager.register("set_field", set_field)
manager.register("clear", clear)

server = manager.get_server()

print("Server running...")
server.serve_forever()

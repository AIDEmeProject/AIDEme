from multiprocessing.managers import BaseManager
import dill

from ..config.general import ASYNC_STORAGE_ADDRESS, ASYNC_STORAGE_AUTHKEY


storage_manager = BaseManager(ASYNC_STORAGE_ADDRESS, ASYNC_STORAGE_AUTHKEY)
for method in ["get_field", "set_field", "clear"]:
    storage_manager.register(method)
storage_manager.connect()


class Pickled:
    def __init__(self, pickled):
        self.pickled = pickled

    def unpickle(self):
        return dill.loads(self.pickled)


def save_field(session_id, field, value):
    storage_manager.set_field(session_id, field, Pickled(dill.dumps(value)))


def load_field(session_id, field):
    return storage_manager.get_field(session_id, field).unpickle()

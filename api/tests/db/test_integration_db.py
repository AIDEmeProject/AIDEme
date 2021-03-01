import time
import dill

from src.db import db_client


def test_db_client():
    assert db_client.hset("key", "field", "value") == 1
    assert db_client.exists("key") == 1
    assert db_client.hget("key", "field").decode("utf-8") == "value"
    assert db_client.delete("key") == 1
    assert db_client.exists("key") == 0

    nested_object = {
        "field1": "value1",
        "field2": {"subfield1": "subvalue1", "subfield2": "subvalue2"},
    }
    assert db_client.hset(
        "key",
        "object",
        dill.dumps(nested_object),
    )
    assert dill.loads(db_client.hget("key", "object")) == nested_object
    assert db_client.delete("key") == 1

    assert db_client.hset("key", "field1", "value1")
    assert db_client.expire("key", 5)  # in seconds
    time.sleep(3)
    assert db_client.exists("key") == 1
    assert db_client.hset("key", "field2", "value2")
    time.sleep(3)
    assert db_client.exists("key") == 0

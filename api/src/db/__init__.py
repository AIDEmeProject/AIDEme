import redis

from ..config.general import REDIS_HOST, REDIS_PORT

db_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

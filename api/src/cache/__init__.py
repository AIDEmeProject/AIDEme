from flask import current_app


class Cache:
    def get(self, key):
        return current_app.config[key]

    def set(self, key, value):
        current_app.config[key] = value


cache = Cache()

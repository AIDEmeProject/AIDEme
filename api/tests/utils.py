class MockStorageManager:
    @staticmethod
    def set_field(*args):
        pass

    @staticmethod
    def get_field(session_id, field):
        if field == "separator":
            return ","
        return None

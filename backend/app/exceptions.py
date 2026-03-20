class NotFoundError(Exception):
    def __init__(self, message: str = "Resource not found"):
        self.message = message
        self.status_code = 404


class AuthError(Exception):
    def __init__(self, message: str = "Authentication failed"):
        self.message = message
        self.status_code = 401


class RateLimitError(Exception):
    def __init__(self, message: str = "Too many attempts"):
        self.message = message
        self.status_code = 429


class ConflictError(Exception):
    def __init__(self, message: str = "Resource already exists"):
        self.message = message
        self.status_code = 409


class ValidationError(Exception):
    def __init__(self, message: str = "Validation failed"):
        self.message = message
        self.status_code = 400


class BusinessError(Exception):
    def __init__(self, message: str = "Business rule violation"):
        self.message = message
        self.status_code = 400

from uuid import UUID
from datetime import datetime, timedelta
from jose import jwt
import bcrypt as _bcrypt
from app.config import settings
from app.exceptions import NotFoundError, AuthError, RateLimitError


def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return _bcrypt.checkpw(password.encode(), hashed.encode())


class AuthService:
    def __init__(self, store_repo=None, admin_repo=None, table_repo=None, session_repo=None):
        self.store_repo = store_repo
        self.admin_repo = admin_repo
        self.table_repo = table_repo
        self.session_repo = session_repo
        self._login_attempts: dict[str, dict] = {}

    def _check_rate_limit(self, key: str):
        attempt = self._login_attempts.get(key)
        if attempt and attempt["count"] >= settings.MAX_LOGIN_ATTEMPTS:
            if datetime.utcnow() - attempt["last"] < timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES):
                raise RateLimitError()
            self._login_attempts.pop(key, None)

    def _record_failure(self, key: str):
        attempt = self._login_attempts.get(key, {"count": 0})
        attempt["count"] = attempt.get("count", 0) + 1
        attempt["last"] = datetime.utcnow()
        self._login_attempts[key] = attempt

    def _create_token(self, payload: dict) -> str:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
        payload["exp"] = expire
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    async def admin_login(self, slug: str, username: str, password: str) -> dict:
        store = await self.store_repo.find_by_slug(slug)
        if not store:
            raise NotFoundError("Store not found")

        admin = await self.admin_repo.find_by_store_and_username(store.id, username)
        if not admin:
            raise AuthError("Invalid credentials")

        key = f"{store.id}:{username}"
        self._check_rate_limit(key)

        if not verify_password(password, admin.password_hash):
            self._record_failure(key)
            raise AuthError("Invalid credentials")

        self._login_attempts.pop(key, None)
        token = self._create_token({"admin_id": str(admin.id), "store_id": str(store.id)})
        return {"token": token}

    async def table_login(self, slug: str, table_number: int, password: str) -> dict:
        store = await self.store_repo.find_by_slug(slug)
        if not store:
            raise NotFoundError("Store not found")

        table = await self.table_repo.find_by_store_and_number(store.id, table_number)
        if not table:
            raise NotFoundError("Table not found")

        if table.password != password:
            raise AuthError("Invalid password")

        session = await self.session_repo.find_active_by_table(table.id)
        if not session:
            session = await self.session_repo.create(table.id, store.id)

        token = self._create_token({
            "table_id": str(table.id), "session_id": str(session.id), "store_id": str(store.id)
        })
        return {"token": token, "session_id": session.id}

    def verify_token(self, token: str) -> dict:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except Exception:
            raise AuthError("Invalid token")

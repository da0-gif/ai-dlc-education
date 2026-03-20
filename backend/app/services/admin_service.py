from uuid import UUID
from app.services.auth_service import hash_password
from app.exceptions import ConflictError


class AdminService:
    def __init__(self, admin_repo=None):
        self.admin_repo = admin_repo

    async def create_admin(self, store_id: UUID, username: str, password: str):
        existing = await self.admin_repo.find_by_store_and_username(store_id, username)
        if existing:
            raise ConflictError("Admin username already exists")
        return await self.admin_repo.create(store_id=store_id, username=username, password_hash=hash_password(password))

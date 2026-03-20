from uuid import UUID
from typing import Optional
from app.exceptions import ConflictError, NotFoundError


class StoreService:
    def __init__(self, store_repo=None):
        self.store_repo = store_repo

    async def create_store(self, name: str, slug: str, address: Optional[str] = None, phone: Optional[str] = None):
        existing = await self.store_repo.find_by_slug(slug)
        if existing:
            raise ConflictError("Store slug already exists")
        return await self.store_repo.create(name=name, slug=slug, address=address, phone=phone)

    async def update_store(self, store_id: UUID, data: dict):
        store = await self.store_repo.find_by_id(store_id)
        if not store:
            raise NotFoundError("Store not found")
        return await self.store_repo.update(store_id, data)

    async def get_stores(self):
        return await self.store_repo.find_all()

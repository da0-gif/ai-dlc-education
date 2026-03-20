from uuid import UUID
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.repositories import StoreRepository
from app.exceptions import NotFoundError


async def resolve_store_id(store_slug: str, db: AsyncSession = Depends(get_db)) -> UUID:
    store = await StoreRepository(db).find_by_slug(store_slug)
    if not store:
        raise NotFoundError("Store not found")
    return store.id

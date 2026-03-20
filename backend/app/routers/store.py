from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import StoreCreate, StoreUpdate, StoreResponse
from app.services.store_service import StoreService
from app.repositories import StoreRepository

router = APIRouter(tags=["stores"])


def get_store_service(db: AsyncSession = Depends(get_db)) -> StoreService:
    return StoreService(store_repo=StoreRepository(db))


@router.post("/api/admin/stores", response_model=StoreResponse)
async def create_store(req: StoreCreate, svc: StoreService = Depends(get_store_service)):
    return await svc.create_store(req.name, req.slug, req.address, req.phone)


@router.get("/api/admin/stores", response_model=list[StoreResponse])
async def get_stores(svc: StoreService = Depends(get_store_service)):
    return await svc.get_stores()


@router.put("/api/admin/stores/{store_id}", response_model=StoreResponse)
async def update_store(store_id: UUID, req: StoreUpdate, svc: StoreService = Depends(get_store_service)):
    return await svc.update_store(store_id, req.model_dump(exclude_unset=True))


@router.get("/api/stores/{store_slug}/info")
async def get_store_info(store_slug: str, svc: StoreService = Depends(get_store_service)):
    store = await svc.get_store_by_slug(store_slug)
    return {"name": store.name, "theme": store.theme}

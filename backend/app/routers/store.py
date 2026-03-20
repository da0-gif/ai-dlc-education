from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import StoreCreate, StoreUpdate, StoreResponse
from app.services.store_service import StoreService
from app.repositories import StoreRepository
from app.dependencies import resolve_store_id
from app.routers.sse import sse_service

router = APIRouter(tags=["stores"])


def get_store_service(db: AsyncSession = Depends(get_db)) -> StoreService:
    return StoreService(store_repo=StoreRepository(db))


@router.post("/api/admin/stores", response_model=StoreResponse)
async def create_store(req: StoreCreate, svc: StoreService = Depends(get_store_service)):
    return await svc.create_store(req.name, req.slug, req.address, req.phone)


@router.get("/api/admin/stores", response_model=list[StoreResponse])
async def get_stores(svc: StoreService = Depends(get_store_service)):
    return await svc.get_stores()


@router.put("/api/admin/stores/{store_slug}", response_model=StoreResponse)
async def update_store(req: StoreUpdate, store_id: UUID = Depends(resolve_store_id), svc: StoreService = Depends(get_store_service)):
    result = await svc.update_store(store_id, req.model_dump(exclude_unset=True))
    data = req.model_dump(exclude_unset=True)
    if "theme" in data:
        await sse_service.broadcast(store_id, "theme_changed", {"theme": data["theme"]})
    return result


@router.delete("/api/admin/stores/{store_slug}")
async def delete_store(store_id: UUID = Depends(resolve_store_id), svc: StoreService = Depends(get_store_service)):
    await svc.delete_store(store_id)
    return {"detail": "Deleted"}


@router.get("/api/stores/{store_slug}/info")
async def get_store_info(store_slug: str, svc: StoreService = Depends(get_store_service)):
    store = await svc.get_store_by_slug(store_slug)
    return {"name": store.name, "theme": store.theme}

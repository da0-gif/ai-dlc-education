from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse
from app.services.category_service import CategoryService
from app.repositories import CategoryRepository

router = APIRouter(tags=["categories"])


def get_category_service(db: AsyncSession = Depends(get_db)) -> CategoryService:
    return CategoryService(category_repo=CategoryRepository(db))


@router.post("/api/admin/stores/{store_id}/categories", response_model=CategoryResponse)
async def create_category(store_id: UUID, req: CategoryCreate, svc: CategoryService = Depends(get_category_service)):
    return await svc.create_category(store_id, req.name)


@router.get("/api/stores/{store_id}/categories", response_model=list[CategoryResponse])
async def get_categories(store_id: UUID, svc: CategoryService = Depends(get_category_service)):
    return await svc.get_categories(store_id)


@router.put("/api/admin/stores/{store_id}/categories/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: UUID, req: CategoryCreate, svc: CategoryService = Depends(get_category_service)):
    return await svc.update_category(category_id, req.name)


@router.delete("/api/admin/stores/{store_id}/categories/{category_id}")
async def delete_category(category_id: UUID, svc: CategoryService = Depends(get_category_service)):
    await svc.delete_category(category_id)
    return {"ok": True}

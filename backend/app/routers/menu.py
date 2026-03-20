from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import MenuResponse, MenuReorder
from app.services.menu_service import MenuService
from app.services.file_storage_service import FileStorageService
from app.repositories import MenuRepository, CategoryRepository
from app.dependencies import resolve_store_id

router = APIRouter(tags=["menus"])


def get_menu_service(db: AsyncSession = Depends(get_db)) -> MenuService:
    return MenuService(
        menu_repo=MenuRepository(db), category_repo=CategoryRepository(db),
        file_service=FileStorageService(),
    )


@router.get("/api/stores/{store_slug}/menus", response_model=list[MenuResponse])
async def get_menus(category_id: Optional[UUID] = None, store_id: UUID = Depends(resolve_store_id), svc: MenuService = Depends(get_menu_service)):
    return await svc.get_menus(store_id, category_id)


@router.post("/api/admin/stores/{store_slug}/menus", response_model=MenuResponse)
async def create_menu(
    name: str = Form(), price: int = Form(), category_id: UUID = Form(),
    description: Optional[str] = Form(None), image: Optional[UploadFile] = File(None),
    store_id: UUID = Depends(resolve_store_id), svc: MenuService = Depends(get_menu_service),
):
    data = {"name": name, "price": price, "category_id": category_id, "description": description}
    return await svc.create_menu(store_id, data, image)


@router.put("/api/admin/stores/{store_slug}/menus/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: UUID, name: Optional[str] = Form(None), price: Optional[int] = Form(None),
    description: Optional[str] = Form(None), image: Optional[UploadFile] = File(None),
    svc: MenuService = Depends(get_menu_service),
):
    data = {k: v for k, v in {"name": name, "price": price, "description": description}.items() if v is not None}
    return await svc.update_menu(menu_id, data, image)


@router.delete("/api/admin/stores/{store_slug}/menus/{menu_id}")
async def delete_menu(menu_id: UUID, svc: MenuService = Depends(get_menu_service)):
    await svc.delete_menu(menu_id)
    return {"ok": True}


@router.put("/api/admin/stores/{store_slug}/menus/reorder")
async def reorder_menus(req: MenuReorder, svc: MenuService = Depends(get_menu_service)):
    await svc.reorder_menus(req.menu_ids)
    return {"ok": True}

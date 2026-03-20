from uuid import UUID
from typing import Optional
from app.exceptions import NotFoundError, ValidationError


class MenuService:
    def __init__(self, menu_repo=None, category_repo=None, file_service=None):
        self.menu_repo = menu_repo
        self.category_repo = category_repo
        self.file_service = file_service

    async def create_menu(self, store_id: UUID, data: dict, image_file=None):
        if data.get("price", 0) <= 0:
            raise ValidationError("Price must be greater than 0")
        cat = await self.category_repo.find_by_id(data["category_id"])
        if not cat:
            raise NotFoundError("Category not found")
        image_url = None
        if image_file:
            image_url = await self.file_service.save(image_file)
        return await self.menu_repo.create(store_id=store_id, image_url=image_url, **data)

    async def get_menus(self, store_id: UUID, category_id: Optional[UUID] = None):
        return await self.menu_repo.find_by_store(store_id, category_id)

    async def update_menu(self, menu_id: UUID, data: dict, image_file=None):
        menu = await self.menu_repo.find_by_id(menu_id)
        if not menu:
            raise NotFoundError("Menu not found")
        if image_file:
            data["image_url"] = await self.file_service.save(image_file)
        return await self.menu_repo.update(menu_id, data)

    async def delete_menu(self, menu_id: UUID):
        menu = await self.menu_repo.find_by_id(menu_id)
        if not menu:
            raise NotFoundError("Menu not found")
        await self.menu_repo.delete(menu_id)

    async def reorder_menus(self, menu_ids: list[UUID]):
        await self.menu_repo.bulk_update_sort_order(menu_ids)

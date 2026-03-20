from uuid import UUID
from app.exceptions import NotFoundError, BusinessError


class CategoryService:
    def __init__(self, category_repo=None):
        self.category_repo = category_repo

    async def create_category(self, store_id: UUID, name: str):
        max_order = await self.category_repo.max_sort_order(store_id)
        return await self.category_repo.create(store_id=store_id, name=name, sort_order=max_order + 1)

    async def get_categories(self, store_id: UUID):
        return await self.category_repo.find_by_store(store_id)

    async def update_category(self, category_id: UUID, name: str):
        cat = await self.category_repo.find_by_id(category_id)
        if not cat:
            raise NotFoundError("Category not found")
        return await self.category_repo.update(category_id, name=name)

    async def delete_category(self, category_id: UUID):
        cat = await self.category_repo.find_by_id(category_id)
        if not cat:
            raise NotFoundError("Category not found")
        if await self.category_repo.has_menus(category_id):
            raise BusinessError("Cannot delete category with menus")
        await self.category_repo.delete(category_id)

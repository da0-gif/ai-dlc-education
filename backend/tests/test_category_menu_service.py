import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.services.category_service import CategoryService
from app.services.menu_service import MenuService
from app.exceptions import BusinessError, ValidationError, NotFoundError


# === CategoryService Tests ===

@pytest.fixture
def category_service():
    return CategoryService(category_repo=AsyncMock())


# TC-012
@pytest.mark.asyncio
async def test_create_category_success(category_service):
    store_id = uuid.uuid4()
    category_service.category_repo.max_sort_order = AsyncMock(return_value=2)
    created = MagicMock()
    created.name = "메인메뉴"
    created.sort_order = 3
    category_service.category_repo.create = AsyncMock(return_value=created)

    result = await category_service.create_category(store_id, "메인메뉴")
    assert result.name == "메인메뉴"


# TC-013
@pytest.mark.asyncio
async def test_delete_category_with_menus(category_service):
    category_service.category_repo.find_by_id = AsyncMock(return_value=MagicMock())
    category_service.category_repo.has_menus = AsyncMock(return_value=True)

    with pytest.raises(BusinessError):
        await category_service.delete_category(uuid.uuid4())


# TC-014
@pytest.mark.asyncio
async def test_delete_category_empty(category_service):
    category_service.category_repo.find_by_id = AsyncMock(return_value=MagicMock())
    category_service.category_repo.has_menus = AsyncMock(return_value=False)
    category_service.category_repo.delete = AsyncMock()

    await category_service.delete_category(uuid.uuid4())
    category_service.category_repo.delete.assert_called_once()


# === MenuService Tests ===

@pytest.fixture
def menu_service():
    return MenuService(menu_repo=AsyncMock(), category_repo=AsyncMock(), file_service=AsyncMock())


# TC-015
@pytest.mark.asyncio
async def test_create_menu_with_image(menu_service):
    menu_service.category_repo.find_by_id = AsyncMock(return_value=MagicMock())
    menu_service.file_service.save = AsyncMock(return_value="/uploads/img.jpg")
    menu_service.menu_repo.create = AsyncMock(return_value=MagicMock(
        id=uuid.uuid4(), name="스테이크", price=25000, image_url="/uploads/img.jpg"
    ))

    result = await menu_service.create_menu(uuid.uuid4(), {"name": "스테이크", "price": 25000, "category_id": uuid.uuid4()}, image_file=MagicMock())
    assert result.image_url == "/uploads/img.jpg"


# TC-016
@pytest.mark.asyncio
async def test_create_menu_invalid_price(menu_service):
    with pytest.raises(ValidationError):
        await menu_service.create_menu(uuid.uuid4(), {"name": "메뉴", "price": 0, "category_id": uuid.uuid4()})


# TC-017
@pytest.mark.asyncio
async def test_reorder_menus(menu_service):
    ids = [uuid.uuid4() for _ in range(3)]
    menu_service.menu_repo.bulk_update_sort_order = AsyncMock()

    await menu_service.reorder_menus(ids)
    menu_service.menu_repo.bulk_update_sort_order.assert_called_once_with(ids)

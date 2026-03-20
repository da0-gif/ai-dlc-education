import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.services.store_service import StoreService
from app.services.admin_service import AdminService
from app.exceptions import ConflictError


# === StoreService Tests ===

@pytest.fixture
def store_service():
    return StoreService(store_repo=AsyncMock())


# TC-008
@pytest.mark.asyncio
async def test_create_store_success(store_service):
    store_service.store_repo.find_by_slug = AsyncMock(return_value=None)
    store_service.store_repo.create = AsyncMock(return_value=MagicMock(id=uuid.uuid4(), name="새매장", slug="new-store"))

    result = await store_service.create_store("새매장", "new-store")
    assert result.slug == "new-store"


# TC-009
@pytest.mark.asyncio
async def test_create_store_duplicate_slug(store_service):
    store_service.store_repo.find_by_slug = AsyncMock(return_value=MagicMock())

    with pytest.raises(ConflictError):
        await store_service.create_store("매장", "existing")


# === AdminService Tests ===

@pytest.fixture
def admin_service():
    return AdminService(admin_repo=AsyncMock())


# TC-010
@pytest.mark.asyncio
async def test_create_admin_success(admin_service):
    admin_service.admin_repo.find_by_store_and_username = AsyncMock(return_value=None)
    admin_service.admin_repo.create = AsyncMock(return_value=MagicMock(id=uuid.uuid4(), username="admin1"))

    result = await admin_service.create_admin(uuid.uuid4(), "admin1", "password")
    assert result.username == "admin1"


# TC-011
@pytest.mark.asyncio
async def test_create_admin_duplicate(admin_service):
    admin_service.admin_repo.find_by_store_and_username = AsyncMock(return_value=MagicMock())

    with pytest.raises(ConflictError):
        await admin_service.create_admin(uuid.uuid4(), "admin1", "pass")

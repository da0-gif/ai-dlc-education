import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.services.order_service import OrderService
from app.exceptions import ValidationError, BusinessError, NotFoundError


@pytest.fixture
def order_service():
    return OrderService(
        order_repo=AsyncMock(),
        order_item_repo=AsyncMock(),
        menu_repo=AsyncMock(),
        sse_service=AsyncMock(),
    )


# TC-018
@pytest.mark.asyncio
async def test_create_order_success(order_service):
    menu = MagicMock(id=uuid.uuid4(), name="스테이크", price=25000)
    order_service.menu_repo.find_by_id = AsyncMock(return_value=menu)
    order_service.order_repo.max_order_number_today = AsyncMock(return_value=0)
    created_order = MagicMock(id=uuid.uuid4(), status="PENDING", order_number=1, total_amount=50000, store_id=uuid.uuid4())
    order_service.order_repo.create = AsyncMock(return_value=created_order)
    order_service.order_item_repo.create_bulk = AsyncMock()

    result = await order_service.create_order(
        uuid.uuid4(), uuid.uuid4(), uuid.uuid4(),
        [{"menu_id": menu.id, "quantity": 2}]
    )
    assert result.status == "PENDING"
    order_service.sse_service.broadcast.assert_called_once()


# TC-019
@pytest.mark.asyncio
async def test_create_order_empty_items(order_service):
    with pytest.raises(ValidationError):
        await order_service.create_order(uuid.uuid4(), uuid.uuid4(), uuid.uuid4(), [])


# TC-020
@pytest.mark.asyncio
async def test_update_order_status_pending_to_preparing(order_service):
    order = MagicMock(id=uuid.uuid4(), status="PENDING", store_id=uuid.uuid4())
    order_service.order_repo.find_by_id = AsyncMock(return_value=order)
    order_service.order_repo.update = AsyncMock(return_value=MagicMock(status="PREPARING"))

    result = await order_service.update_order_status(order.id, "PREPARING")
    assert result.status == "PREPARING"


# TC-021
@pytest.mark.asyncio
async def test_update_order_status_reverse(order_service):
    order = MagicMock(id=uuid.uuid4(), status="COMPLETED", store_id=uuid.uuid4())
    order_service.order_repo.find_by_id = AsyncMock(return_value=order)

    with pytest.raises(BusinessError):
        await order_service.update_order_status(order.id, "PREPARING")


# TC-022
@pytest.mark.asyncio
async def test_delete_order(order_service):
    order = MagicMock(id=uuid.uuid4(), store_id=uuid.uuid4(), table_id=uuid.uuid4())
    order_service.order_repo.find_by_id = AsyncMock(return_value=order)
    order_service.order_item_repo.delete_by_order = AsyncMock()
    order_service.order_repo.delete = AsyncMock()

    await order_service.delete_order(order.id)
    order_service.order_repo.delete.assert_called_once()
    order_service.sse_service.broadcast.assert_called_once()

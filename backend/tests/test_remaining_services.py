import pytest
import uuid
import json
from datetime import date
from unittest.mock import AsyncMock, MagicMock
from app.services.table_service import TableService
from app.services.parking_service import ParkingService
from app.services.daily_sales_service import DailySalesService
from app.services.file_storage_service import FileStorageService
from app.exceptions import BusinessError, AuthError, ValidationError


# === TableService Tests ===

@pytest.fixture
def table_service():
    return TableService(
        table_repo=AsyncMock(), session_repo=AsyncMock(), order_repo=AsyncMock(),
        order_item_repo=AsyncMock(), order_history_repo=AsyncMock(),
        parking_repo=AsyncMock(), sse_service=AsyncMock(),
    )


# TC-023
@pytest.mark.asyncio
async def test_complete_table_success(table_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    orders = [MagicMock(id=uuid.uuid4(), total_amount=15000), MagicMock(id=uuid.uuid4(), total_amount=20000)]
    table_service.session_repo.find_active_by_table = AsyncMock(return_value=session)
    table_service.order_repo.find_by_session = AsyncMock(return_value=orders)
    table_service.order_item_repo.find_by_orders = AsyncMock(return_value=[])
    table_service.parking_repo.find_by_session = AsyncMock(return_value=None)
    table_service.order_history_repo.create = AsyncMock()
    table_service.order_repo.delete = AsyncMock()
    table_service.session_repo.update = AsyncMock()

    store_id = uuid.uuid4()
    table_id = uuid.uuid4()
    await table_service.complete_table(store_id, table_id)
    table_service.order_history_repo.create.assert_called_once()
    table_service.sse_service.broadcast.assert_called_once()


# TC-024
@pytest.mark.asyncio
async def test_complete_table_no_session(table_service):
    table_service.session_repo.find_active_by_table = AsyncMock(return_value=None)

    with pytest.raises(BusinessError):
        await table_service.complete_table(uuid.uuid4(), uuid.uuid4())


# TC-025
@pytest.mark.asyncio
async def test_complete_table_no_orders(table_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    table_service.session_repo.find_active_by_table = AsyncMock(return_value=session)
    table_service.order_repo.find_by_session = AsyncMock(return_value=[])
    table_service.order_item_repo.find_by_orders = AsyncMock(return_value=[])
    table_service.parking_repo.find_by_session = AsyncMock(return_value=None)
    table_service.order_history_repo.create = AsyncMock()
    table_service.session_repo.update = AsyncMock()

    await table_service.complete_table(uuid.uuid4(), uuid.uuid4())
    table_service.session_repo.update.assert_called_once()


# TC-026
@pytest.mark.asyncio
async def test_get_order_history_with_date_filter(table_service):
    histories = [MagicMock(), MagicMock()]
    table_service.order_history_repo.find_by_table = AsyncMock(return_value=histories)

    result = await table_service.get_order_history(uuid.uuid4(), uuid.uuid4(), date_filter=date(2026, 3, 20))
    assert len(result) == 2


# === ParkingService Tests ===

@pytest.fixture
def parking_service():
    return ParkingService(parking_repo=AsyncMock(), order_repo=AsyncMock(), session_repo=AsyncMock())


# TC-027
@pytest.mark.asyncio
async def test_register_parking_success(parking_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    parking_service.session_repo.find_by_id = AsyncMock(return_value=session)
    parking_service.order_repo.find_completed_by_session = AsyncMock(return_value=[MagicMock()])
    parking_service.parking_repo.find_by_session = AsyncMock(return_value=None)
    parking_service.parking_repo.create = AsyncMock(return_value=MagicMock(plate_number="12가3456"))

    result = await parking_service.register_parking(uuid.uuid4(), uuid.uuid4(), session.id, "12가3456")
    assert result.plate_number == "12가3456"


# TC-028
@pytest.mark.asyncio
async def test_register_parking_no_completed_order(parking_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    parking_service.session_repo.find_by_id = AsyncMock(return_value=session)
    parking_service.order_repo.find_completed_by_session = AsyncMock(return_value=[])

    with pytest.raises(AuthError):
        await parking_service.register_parking(uuid.uuid4(), uuid.uuid4(), session.id, "12가3456")


# TC-029
@pytest.mark.asyncio
async def test_register_parking_invalid_plate(parking_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    parking_service.session_repo.find_by_id = AsyncMock(return_value=session)
    parking_service.order_repo.find_completed_by_session = AsyncMock(return_value=[MagicMock()])

    with pytest.raises(ValidationError):
        await parking_service.register_parking(uuid.uuid4(), uuid.uuid4(), session.id, "invalid")


# TC-030
@pytest.mark.asyncio
async def test_register_parking_update_existing(parking_service):
    session = MagicMock(id=uuid.uuid4(), is_active=True)
    existing = MagicMock(id=uuid.uuid4())
    parking_service.session_repo.find_by_id = AsyncMock(return_value=session)
    parking_service.order_repo.find_completed_by_session = AsyncMock(return_value=[MagicMock()])
    parking_service.parking_repo.find_by_session = AsyncMock(return_value=existing)
    parking_service.parking_repo.update = AsyncMock(return_value=MagicMock(plate_number="34나5678"))

    result = await parking_service.register_parking(uuid.uuid4(), uuid.uuid4(), session.id, "34나5678")
    assert result.plate_number == "34나5678"


# === DailySalesService Tests ===

@pytest.fixture
def daily_sales_service():
    return DailySalesService(daily_sales_repo=AsyncMock(), order_repo=AsyncMock())


# TC-031
@pytest.mark.asyncio
async def test_close_daily_sales_success(daily_sales_service):
    orders = [MagicMock(total_amount=15000), MagicMock(total_amount=20000), MagicMock(total_amount=10000)]
    daily_sales_service.order_repo.find_completed_by_store_and_date = AsyncMock(return_value=orders)
    daily_sales_service.daily_sales_repo.upsert = AsyncMock(return_value=MagicMock(total_amount=45000, order_count=3))

    result = await daily_sales_service.close_daily_sales(uuid.uuid4())
    assert result.total_amount == 45000
    assert result.order_count == 3


# TC-032
@pytest.mark.asyncio
async def test_close_daily_sales_re_close(daily_sales_service):
    orders = [MagicMock(total_amount=15000), MagicMock(total_amount=20000), MagicMock(total_amount=10000), MagicMock(total_amount=5000)]
    daily_sales_service.order_repo.find_completed_by_store_and_date = AsyncMock(return_value=orders)
    daily_sales_service.daily_sales_repo.upsert = AsyncMock(return_value=MagicMock(total_amount=50000, order_count=4))

    result = await daily_sales_service.close_daily_sales(uuid.uuid4())
    assert result.total_amount == 50000
    assert result.order_count == 4


# === FileStorageService Tests ===

# TC-033
@pytest.mark.asyncio
async def test_save_file_success():
    service = FileStorageService(upload_dir="/tmp/test_uploads")
    file = MagicMock()
    file.filename = "image.jpg"
    file.size = 1024
    file.read = AsyncMock(return_value=b"fake image data")

    result = await service.save(file)
    assert result.endswith(".jpg")


# TC-034
@pytest.mark.asyncio
async def test_save_file_invalid_extension():
    service = FileStorageService(upload_dir="/tmp/test_uploads")
    file = MagicMock()
    file.filename = "malware.exe"

    with pytest.raises(ValidationError):
        await service.save(file)


# TC-035
@pytest.mark.asyncio
async def test_save_file_too_large():
    service = FileStorageService(upload_dir="/tmp/test_uploads")
    file = MagicMock()
    file.filename = "big.jpg"
    file.size = 6 * 1024 * 1024

    with pytest.raises(ValidationError):
        await service.save(file)

from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import DailySalesResponse
from app.services.daily_sales_service import DailySalesService
from app.repositories import DailySalesRepository, OrderRepository
from app.dependencies import resolve_store_id

router = APIRouter(tags=["daily-sales"])


def get_daily_sales_service(db: AsyncSession = Depends(get_db)) -> DailySalesService:
    return DailySalesService(daily_sales_repo=DailySalesRepository(db), order_repo=OrderRepository(db))


@router.post("/api/admin/stores/{store_slug}/daily-sales/close", response_model=DailySalesResponse)
async def close_daily_sales(store_id: UUID = Depends(resolve_store_id), svc: DailySalesService = Depends(get_daily_sales_service)):
    return await svc.close_daily_sales(store_id)

from uuid import UUID
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import TableCreate, TableResponse, OrderHistoryResponse
from app.services.table_service import TableService
from app.services.sse_service import SSEService
from app.repositories import (TableRepository, SessionRepository, OrderRepository,
                               OrderItemRepository, OrderHistoryRepository, ParkingRepository)
from app.dependencies import resolve_store_id

router = APIRouter(prefix="/api/admin/stores/{store_slug}", tags=["tables"])
sse = SSEService()


def get_table_service(db: AsyncSession = Depends(get_db)) -> TableService:
    return TableService(
        table_repo=TableRepository(db), session_repo=SessionRepository(db),
        order_repo=OrderRepository(db), order_item_repo=OrderItemRepository(db),
        order_history_repo=OrderHistoryRepository(db), parking_repo=ParkingRepository(db),
        sse_service=sse,
    )


@router.post("/tables", response_model=TableResponse)
async def create_table(req: TableCreate, store_id: UUID = Depends(resolve_store_id), svc: TableService = Depends(get_table_service)):
    return await svc.create_table(store_id, req.table_number, req.password)


@router.get("/tables", response_model=list[TableResponse])
async def get_tables(store_id: UUID = Depends(resolve_store_id), svc: TableService = Depends(get_table_service)):
    return await svc.get_tables(store_id)


@router.post("/tables/{table_id}/complete")
async def complete_table(table_id: UUID, store_id: UUID = Depends(resolve_store_id), svc: TableService = Depends(get_table_service)):
    await svc.complete_table(store_id, table_id)
    return {"ok": True}


@router.get("/tables/{table_id}/history", response_model=list[OrderHistoryResponse])
async def get_order_history(
    table_id: UUID, date: Optional[date] = None,
    store_id: UUID = Depends(resolve_store_id), svc: TableService = Depends(get_table_service),
):
    return await svc.get_order_history(store_id, table_id, date)

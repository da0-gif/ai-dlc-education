from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService
from app.services.sse_service import SSEService
from app.repositories import OrderRepository, OrderItemRepository, MenuRepository

router = APIRouter(tags=["orders"])
sse = SSEService()


def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        order_repo=OrderRepository(db), order_item_repo=OrderItemRepository(db),
        menu_repo=MenuRepository(db), sse_service=sse,
    )


@router.post("/api/stores/{store_id}/tables/{table_id}/orders", response_model=OrderResponse)
async def create_order(store_id: UUID, table_id: UUID, req: OrderCreate, svc: OrderService = Depends(get_order_service)):
    return await svc.create_order(store_id, table_id, req.session_id, [i.model_dump() for i in req.items])


@router.get("/api/stores/{store_id}/tables/{table_id}/orders", response_model=list[OrderResponse])
async def get_orders(session_id: UUID, svc: OrderService = Depends(get_order_service)):
    return await svc.get_orders(session_id)


@router.put("/api/admin/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: UUID, req: OrderStatusUpdate, svc: OrderService = Depends(get_order_service)):
    return await svc.update_order_status(order_id, req.status)


@router.delete("/api/admin/orders/{order_id}")
async def delete_order(order_id: UUID, svc: OrderService = Depends(get_order_service)):
    await svc.delete_order(order_id)
    return {"ok": True}

from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService
from app.repositories import OrderRepository, OrderItemRepository, MenuRepository
from app.dependencies import resolve_store_id
from app.routers.sse import sse_service

router = APIRouter(tags=["orders"])


def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        order_repo=OrderRepository(db), order_item_repo=OrderItemRepository(db),
        menu_repo=MenuRepository(db), sse_service=sse_service,
    )


@router.post("/api/stores/{store_slug}/tables/{table_id}/orders", response_model=OrderResponse)
async def create_order(table_id: UUID, req: OrderCreate, store_id: UUID = Depends(resolve_store_id), svc: OrderService = Depends(get_order_service)):
    return await svc.create_order(store_id, table_id, req.session_id, [i.model_dump() for i in req.items])


@router.get("/api/stores/{store_slug}/tables/{table_id}/orders", response_model=list[OrderResponse])
async def get_orders(session_id: UUID, svc: OrderService = Depends(get_order_service)):
    return await svc.get_orders(session_id)


@router.get("/api/admin/stores/{store_slug}/orders", response_model=list[OrderResponse])
async def get_store_orders(store_id: UUID = Depends(resolve_store_id), svc: OrderService = Depends(get_order_service)):
    return await svc.get_active_orders(store_id)


@router.put("/api/admin/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: UUID, req: OrderStatusUpdate, svc: OrderService = Depends(get_order_service)):
    return await svc.update_order_status(order_id, req.status)


@router.delete("/api/admin/orders/{order_id}")
async def delete_order(order_id: UUID, svc: OrderService = Depends(get_order_service)):
    await svc.delete_order(order_id)
    return {"ok": True}

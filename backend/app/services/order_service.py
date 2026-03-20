from uuid import UUID
from app.exceptions import ValidationError, BusinessError, NotFoundError

VALID_TRANSITIONS = {
    "PENDING": "PREPARING",
    "PREPARING": "COMPLETED",
}


class OrderService:
    def __init__(self, order_repo=None, order_item_repo=None, menu_repo=None, sse_service=None):
        self.order_repo = order_repo
        self.order_item_repo = order_item_repo
        self.menu_repo = menu_repo
        self.sse_service = sse_service

    async def create_order(self, store_id: UUID, table_id: UUID, session_id: UUID, items: list[dict]):
        if not items:
            raise ValidationError("Order must have at least one item")

        order_number = await self.order_repo.max_order_number_today(store_id) + 1
        total = 0
        order_items = []
        for item in items:
            menu = await self.menu_repo.find_by_id(item["menu_id"])
            subtotal = menu.price * item["quantity"]
            total += subtotal
            order_items.append({"menu_id": menu.id, "menu_name": menu.name, "unit_price": menu.price,
                                "quantity": item["quantity"], "subtotal": subtotal})

        order = await self.order_repo.create(
            store_id=store_id, table_id=table_id, session_id=session_id,
            order_number=order_number, status="PENDING", total_amount=total
        )
        await self.order_item_repo.create_bulk(order.id, order_items)
        await self.sse_service.broadcast(store_id, "order:created", {"order_id": str(order.id)})
        return order

    async def get_orders(self, session_id: UUID):
        return await self.order_repo.find_by_session(session_id)

    async def update_order_status(self, order_id: UUID, new_status: str):
        order = await self.order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")
        if VALID_TRANSITIONS.get(order.status) != new_status:
            raise BusinessError(f"Cannot transition from {order.status} to {new_status}")
        result = await self.order_repo.update(order_id, {"status": new_status})
        await self.sse_service.broadcast(order.store_id, "order:status_changed", {"order_id": str(order_id)})
        return result

    async def delete_order(self, order_id: UUID):
        order = await self.order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")
        await self.order_item_repo.delete_by_order(order_id)
        await self.order_repo.delete(order_id)
        await self.sse_service.broadcast(order.store_id, "order:deleted", {"order_id": str(order_id), "table_id": str(order.table_id)})

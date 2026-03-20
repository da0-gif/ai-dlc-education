from uuid import UUID
from typing import Optional
from datetime import datetime, date
from app.exceptions import BusinessError


class TableService:
    def __init__(self, table_repo=None, session_repo=None, order_repo=None,
                 order_item_repo=None, order_history_repo=None, parking_repo=None, sse_service=None):
        self.table_repo = table_repo
        self.session_repo = session_repo
        self.order_repo = order_repo
        self.order_item_repo = order_item_repo
        self.order_history_repo = order_history_repo
        self.parking_repo = parking_repo
        self.sse_service = sse_service

    async def create_table(self, store_id: UUID, table_number: int, password: str):
        return await self.table_repo.create(store_id=store_id, table_number=table_number, password=password)

    async def get_tables(self, store_id: UUID):
        return await self.table_repo.find_by_store(store_id)

    async def complete_table(self, store_id: UUID, table_id: UUID):
        session = await self.session_repo.find_active_by_table(table_id)
        if not session:
            raise BusinessError("No active session")

        orders = await self.order_repo.find_by_session(session.id)
        order_ids = [o.id for o in orders]
        items = await self.order_item_repo.find_by_orders(order_ids) if order_ids else []
        parking = await self.parking_repo.find_by_session(session.id)

        total = sum(o.total_amount for o in orders)
        order_data = {
            "orders": [{"id": str(o.id), "total_amount": o.total_amount} for o in orders],
            "parking": {"plate_number": parking.plate_number} if parking else None,
        }

        await self.order_history_repo.create(
            store_id=store_id, table_id=table_id, session_id=session.id,
            order_data=order_data, total_amount=total, completed_at=datetime.utcnow()
        )

        for oid in order_ids:
            await self.order_repo.delete(oid)
        if parking:
            await self.parking_repo.delete_by_session(session.id)

        await self.session_repo.update(session.id, {"is_active": False, "ended_at": datetime.utcnow()})
        await self.sse_service.broadcast(store_id, "table:completed", {"table_id": str(table_id)})

    async def get_order_history(self, store_id: UUID, table_id: UUID, date_filter: Optional[date] = None):
        return await self.order_history_repo.find_by_table(store_id, table_id, date_filter)

    async def delete_table(self, table_id: UUID):
        session = await self.session_repo.find_active_by_table(table_id)
        if session:
            raise BusinessError("Cannot delete table with active session")
        await self.table_repo.delete(table_id)

    async def update_table_password(self, table_id: UUID, password: str):
        return await self.table_repo.update(table_id, {"password": password})

    async def get_active_tables(self, store_id: UUID) -> list[UUID]:
        tables = await self.table_repo.find_by_store(store_id)
        active = []
        for t in tables:
            session = await self.session_repo.find_active_by_table(t.id)
            if session:
                active.append(t.id)
        return active

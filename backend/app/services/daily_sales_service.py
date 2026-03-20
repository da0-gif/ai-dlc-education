from uuid import UUID
from datetime import date, datetime


class DailySalesService:
    def __init__(self, daily_sales_repo=None, order_repo=None):
        self.daily_sales_repo = daily_sales_repo
        self.order_repo = order_repo

    async def close_daily_sales(self, store_id: UUID):
        today = date.today()
        orders = await self.order_repo.find_completed_by_store_and_date(store_id, today)
        total = sum(o.total_amount for o in orders)
        count = len(orders)
        return await self.daily_sales_repo.upsert(
            store_id=store_id, sales_date=today, total_amount=total,
            order_count=count, closed_at=datetime.utcnow()
        )

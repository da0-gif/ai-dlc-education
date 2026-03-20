from uuid import UUID
from typing import Optional
from datetime import date, datetime
from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import (Store, Admin, Category, Menu, Table, Session,
                         Order, OrderItem, OrderHistory, Parking, DailySales)


class StoreRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Store:
        store = Store(**kwargs)
        self.db.add(store)
        await self.db.flush()
        return store

    async def find_by_id(self, id: UUID) -> Optional[Store]:
        return await self.db.get(Store, id)

    async def find_by_slug(self, slug: str) -> Optional[Store]:
        result = await self.db.execute(select(Store).where(Store.slug == slug))
        return result.scalar_one_or_none()

    async def find_all(self) -> list[Store]:
        result = await self.db.execute(select(Store))
        return list(result.scalars().all())

    async def update(self, store_id: UUID, data: dict) -> Store:
        store = await self.find_by_id(store_id)
        for k, v in data.items():
            setattr(store, k, v)
        await self.db.flush()
        return store

    async def delete(self, store_id: UUID):
        store = await self.find_by_id(store_id)
        if store:
            await self.db.delete(store)
            await self.db.flush()


class AdminRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Admin:
        admin = Admin(**kwargs)
        self.db.add(admin)
        await self.db.flush()
        return admin

    async def find_by_store_and_username(self, store_id: UUID, username: str) -> Optional[Admin]:
        result = await self.db.execute(
            select(Admin).where(Admin.store_id == store_id, Admin.username == username))
        return result.scalar_one_or_none()


class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Category:
        cat = Category(**kwargs)
        self.db.add(cat)
        await self.db.flush()
        return cat

    async def find_by_store(self, store_id: UUID) -> list[Category]:
        result = await self.db.execute(
            select(Category).where(Category.store_id == store_id).order_by(Category.sort_order))
        return list(result.scalars().all())

    async def find_by_id(self, id: UUID) -> Optional[Category]:
        return await self.db.get(Category, id)

    async def update(self, category_id: UUID, **kwargs) -> Category:
        cat = await self.find_by_id(category_id)
        for k, v in kwargs.items():
            setattr(cat, k, v)
        await self.db.flush()
        return cat

    async def delete(self, id: UUID):
        await self.db.execute(delete(Category).where(Category.id == id))

    async def has_menus(self, category_id: UUID) -> bool:
        result = await self.db.execute(
            select(func.count()).select_from(Menu).where(Menu.category_id == category_id))
        return result.scalar() > 0

    async def max_sort_order(self, store_id: UUID) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.max(Category.sort_order), -1)).where(Category.store_id == store_id))
        return result.scalar()


class MenuRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Menu:
        menu = Menu(**kwargs)
        self.db.add(menu)
        await self.db.flush()
        return menu

    async def find_by_store(self, store_id: UUID, category_id: Optional[UUID] = None) -> list[Menu]:
        q = select(Menu).where(Menu.store_id == store_id)
        if category_id:
            q = q.where(Menu.category_id == category_id)
        q = q.order_by(Menu.sort_order)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def find_by_id(self, id: UUID) -> Optional[Menu]:
        return await self.db.get(Menu, id)

    async def update(self, menu_id: UUID, data: dict) -> Menu:
        menu = await self.find_by_id(menu_id)
        for k, v in data.items():
            setattr(menu, k, v)
        await self.db.flush()
        return menu

    async def delete(self, id: UUID):
        await self.db.execute(delete(Menu).where(Menu.id == id))

    async def bulk_update_sort_order(self, menu_ids: list[UUID]):
        for i, mid in enumerate(menu_ids):
            await self.db.execute(update(Menu).where(Menu.id == mid).values(sort_order=i))


class TableRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Table:
        table = Table(**kwargs)
        self.db.add(table)
        await self.db.flush()
        return table

    async def find_by_store(self, store_id: UUID) -> list[Table]:
        result = await self.db.execute(
            select(Table).where(Table.store_id == store_id).order_by(Table.table_number))
        return list(result.scalars().all())

    async def find_by_store_and_number(self, store_id: UUID, table_number: int) -> Optional[Table]:
        result = await self.db.execute(
            select(Table).where(Table.store_id == store_id, Table.table_number == table_number))
        return result.scalar_one_or_none()

    async def find_by_id(self, id: UUID) -> Optional[Table]:
        return await self.db.get(Table, id)


class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, table_id: UUID, store_id: UUID) -> Session:
        s = Session(table_id=table_id, store_id=store_id)
        self.db.add(s)
        await self.db.flush()
        return s

    async def find_active_by_table(self, table_id: UUID) -> Optional[Session]:
        result = await self.db.execute(
            select(Session).where(Session.table_id == table_id, Session.is_active == True))
        return result.scalar_one_or_none()

    async def find_by_id(self, id: UUID) -> Optional[Session]:
        return await self.db.get(Session, id)

    async def update(self, session_id: UUID, data: dict) -> Session:
        s = await self.find_by_id(session_id)
        for k, v in data.items():
            setattr(s, k, v)
        await self.db.flush()
        return s


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Order:
        order = Order(**kwargs)
        self.db.add(order)
        await self.db.flush()
        return order

    async def find_by_session(self, session_id: UUID) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(Order.session_id == session_id).order_by(Order.created_at))
        return list(result.scalars().all())

    async def find_by_id(self, id: UUID) -> Optional[Order]:
        return await self.db.get(Order, id)

    async def find_completed_by_session(self, session_id: UUID) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(Order.session_id == session_id, Order.status == "COMPLETED"))
        return list(result.scalars().all())

    async def find_completed_by_store_and_date(self, store_id: UUID, d: date) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(
                Order.store_id == store_id, Order.status == "COMPLETED",
                func.date(Order.created_at) == d))
        return list(result.scalars().all())

    async def update(self, order_id: UUID, data: dict) -> Order:
        order = await self.find_by_id(order_id)
        for k, v in data.items():
            setattr(order, k, v)
        await self.db.flush()
        return order

    async def delete(self, id: UUID):
        await self.db.execute(delete(Order).where(Order.id == id))

    async def max_order_number_today(self, store_id: UUID) -> int:
        today = date.today()
        result = await self.db.execute(
            select(func.coalesce(func.max(Order.order_number), 0)).where(
                Order.store_id == store_id, func.date(Order.created_at) == today))
        return result.scalar()


class OrderItemRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_bulk(self, order_id: UUID, items: list[dict]) -> list[OrderItem]:
        result = []
        for item in items:
            oi = OrderItem(order_id=order_id, **item)
            self.db.add(oi)
            result.append(oi)
        await self.db.flush()
        return result

    async def find_by_order(self, order_id: UUID) -> list[OrderItem]:
        result = await self.db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        return list(result.scalars().all())

    async def find_by_orders(self, order_ids: list[UUID]) -> list[OrderItem]:
        if not order_ids:
            return []
        result = await self.db.execute(select(OrderItem).where(OrderItem.order_id.in_(order_ids)))
        return list(result.scalars().all())

    async def delete_by_order(self, order_id: UUID):
        await self.db.execute(delete(OrderItem).where(OrderItem.order_id == order_id))


class OrderHistoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> OrderHistory:
        h = OrderHistory(**kwargs)
        self.db.add(h)
        await self.db.flush()
        return h

    async def find_by_table(self, store_id: UUID, table_id: UUID, date_filter: Optional[date] = None) -> list[OrderHistory]:
        q = select(OrderHistory).where(
            OrderHistory.store_id == store_id, OrderHistory.table_id == table_id)
        if date_filter:
            q = q.where(func.date(OrderHistory.completed_at) == date_filter)
        q = q.order_by(OrderHistory.completed_at.desc())
        result = await self.db.execute(q)
        return list(result.scalars().all())


class ParkingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Parking:
        p = Parking(**kwargs)
        self.db.add(p)
        await self.db.flush()
        return p

    async def find_by_session(self, session_id: UUID) -> Optional[Parking]:
        result = await self.db.execute(select(Parking).where(Parking.session_id == session_id))
        return result.scalar_one_or_none()

    async def update(self, parking_id: UUID, **kwargs) -> Parking:
        p = await self.db.get(Parking, parking_id)
        for k, v in kwargs.items():
            setattr(p, k, v)
        await self.db.flush()
        return p

    async def delete_by_session(self, session_id: UUID):
        await self.db.execute(delete(Parking).where(Parking.session_id == session_id))


class DailySalesRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert(self, **kwargs) -> DailySales:
        existing = await self.find_by_store_and_date(kwargs["store_id"], kwargs["sales_date"])
        if existing:
            for k, v in kwargs.items():
                setattr(existing, k, v)
            await self.db.flush()
            return existing
        ds = DailySales(**kwargs)
        self.db.add(ds)
        await self.db.flush()
        return ds

    async def find_by_store_and_date(self, store_id: UUID, sales_date: date) -> Optional[DailySales]:
        result = await self.db.execute(
            select(DailySales).where(DailySales.store_id == store_id, DailySales.sales_date == sales_date))
        return result.scalar_one_or_none()

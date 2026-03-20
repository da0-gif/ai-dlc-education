import re
from uuid import UUID
from app.exceptions import AuthError, ValidationError

PLATE_PATTERN = re.compile(r'^(\d{2,3}[가-힣]\d{4}|[가-힣]{2}\d{2}[가-힣]\d{4})$')


class ParkingService:
    def __init__(self, parking_repo=None, order_repo=None, session_repo=None):
        self.parking_repo = parking_repo
        self.order_repo = order_repo
        self.session_repo = session_repo

    async def register_parking(self, store_id: UUID, table_id: UUID, session_id: UUID, plate_number: str):
        session = await self.session_repo.find_by_id(session_id)
        completed = await self.order_repo.find_completed_by_session(session_id)
        if not completed:
            raise AuthError("No completed orders")

        if not PLATE_PATTERN.match(plate_number):
            raise ValidationError("Invalid plate number format")

        existing = await self.parking_repo.find_by_session(session_id)
        if existing:
            return await self.parking_repo.update(existing.id, plate_number=plate_number)
        return await self.parking_repo.create(session_id=session_id, store_id=store_id, plate_number=plate_number)

    async def get_parking(self, session_id: UUID):
        return await self.parking_repo.find_by_session(session_id)

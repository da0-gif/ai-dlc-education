from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import ParkingCreate, ParkingUpdate, ParkingResponse
from app.services.parking_service import ParkingService
from app.repositories import ParkingRepository, OrderRepository, SessionRepository

router = APIRouter(prefix="/api/stores/{store_id}/tables/{table_id}/parking", tags=["parking"])


def get_parking_service(db: AsyncSession = Depends(get_db)) -> ParkingService:
    return ParkingService(parking_repo=ParkingRepository(db), order_repo=OrderRepository(db), session_repo=SessionRepository(db))


@router.post("", response_model=ParkingResponse)
async def register_parking(store_id: UUID, table_id: UUID, req: ParkingCreate, svc: ParkingService = Depends(get_parking_service)):
    return await svc.register_parking(store_id, table_id, req.session_id, req.plate_number)


@router.put("/{parking_id}", response_model=ParkingResponse)
async def update_parking(store_id: UUID, table_id: UUID, parking_id: UUID, req: ParkingUpdate, svc: ParkingService = Depends(get_parking_service)):
    return await svc.register_parking(store_id, table_id, parking_id, req.plate_number)


@router.get("", response_model=Optional[ParkingResponse])
async def get_parking(session_id: UUID, svc: ParkingService = Depends(get_parking_service)):
    return await svc.get_parking(session_id)

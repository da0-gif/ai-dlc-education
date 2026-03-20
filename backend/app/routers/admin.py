from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import AdminCreate, AdminResponse
from app.services.admin_service import AdminService
from app.repositories import AdminRepository

router = APIRouter(prefix="/api/admin/stores/{store_id}/admins", tags=["admins"])


def get_admin_service(db: AsyncSession = Depends(get_db)) -> AdminService:
    return AdminService(admin_repo=AdminRepository(db))


@router.post("", response_model=AdminResponse)
async def create_admin(store_id: UUID, req: AdminCreate, svc: AdminService = Depends(get_admin_service)):
    return await svc.create_admin(store_id, req.username, req.password)

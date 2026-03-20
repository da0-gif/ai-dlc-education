from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import AdminLoginRequest, TableLoginRequest, TokenResponse, TableLoginResponse
from app.services.auth_service import AuthService
from app.repositories import StoreRepository, AdminRepository, TableRepository, SessionRepository

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(
        store_repo=StoreRepository(db), admin_repo=AdminRepository(db),
        table_repo=TableRepository(db), session_repo=SessionRepository(db),
    )


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(req: AdminLoginRequest, svc: AuthService = Depends(get_auth_service)):
    return await svc.admin_login(req.slug, req.username, req.password)


@router.post("/table/login", response_model=TableLoginResponse)
async def table_login(req: TableLoginRequest, svc: AuthService = Depends(get_auth_service)):
    return await svc.table_login(req.slug, req.table_number, req.password)

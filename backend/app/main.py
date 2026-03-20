from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.exceptions import NotFoundError, AuthError, RateLimitError, ConflictError, ValidationError, BusinessError
from app.routers import auth, store, admin, category, menu, order, table, parking, sse, daily_sales
from app.database import engine
from app.models import Base


async def create_default_admin():
    from app.database import async_session
    from app.services.auth_service import hash_password
    from sqlalchemy import select
    from app.models import Store, Admin

    async with async_session() as session:
        result = await session.execute(select(Store).where(Store.slug == "test-store"))
        store = result.scalar_one_or_none()
        if not store:
            store = Store(name="Test Store", slug="test-store")
            session.add(store)
            await session.flush()

        result = await session.execute(
            select(Admin).where(Admin.store_id == store.id, Admin.username == "admin"))
        if not result.scalar_one_or_none():
            admin = Admin(store_id=store.id, username="admin", password_hash=hash_password("admin1234"))
            session.add(admin)

        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await create_default_admin()
    yield


app = FastAPI(title="Table Order API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(store.router)
app.include_router(admin.router)
app.include_router(category.router)
app.include_router(menu.router)
app.include_router(order.router)
app.include_router(table.router)
app.include_router(parking.router)
app.include_router(sse.router)
app.include_router(daily_sales.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(AuthError)
async def auth_handler(request: Request, exc: AuthError):
    return JSONResponse(status_code=401, content={"detail": exc.message})


@app.exception_handler(RateLimitError)
async def rate_limit_handler(request: Request, exc: RateLimitError):
    return JSONResponse(status_code=429, content={"detail": exc.message})


@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(ValidationError)
async def validation_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(BusinessError)
async def business_handler(request: Request, exc: BusinessError):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.get("/health")
async def health():
    return {"status": "ok"}

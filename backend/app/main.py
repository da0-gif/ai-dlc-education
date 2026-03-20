from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.exceptions import NotFoundError, AuthError, RateLimitError, ConflictError, ValidationError, BusinessError
from app.routers import auth, store, admin, category, menu, order, table, parking, sse, daily_sales

app = FastAPI(title="Table Order API", version="1.0.0")

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

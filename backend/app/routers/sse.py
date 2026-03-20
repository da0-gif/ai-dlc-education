from uuid import UUID
from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from app.services.sse_service import SSEService
from app.dependencies import resolve_store_id

router = APIRouter(tags=["sse"])
sse_service = SSEService()


@router.get("/api/admin/stores/{store_slug}/orders/stream")
async def sse_stream(store_id: UUID = Depends(resolve_store_id)):
    return EventSourceResponse(sse_service.connect(store_id))

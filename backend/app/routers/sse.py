from uuid import UUID
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.services.sse_service import SSEService

router = APIRouter(tags=["sse"])
sse_service = SSEService()


@router.get("/api/admin/stores/{store_id}/orders/stream")
async def sse_stream(store_id: UUID):
    return EventSourceResponse(sse_service.connect(store_id))

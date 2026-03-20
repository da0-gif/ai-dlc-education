import asyncio
import json
from uuid import UUID
from typing import AsyncGenerator


class SSEService:
    def __init__(self):
        self._connections: dict[str, list[asyncio.Queue]] = {}

    async def connect(self, store_id: UUID) -> AsyncGenerator:
        key = str(store_id)
        queue: asyncio.Queue = asyncio.Queue()
        self._connections.setdefault(key, []).append(queue)
        try:
            while True:
                data = await queue.get()
                yield data
        finally:
            self._connections[key].remove(queue)

    async def broadcast(self, store_id: UUID, event_type: str, data: dict) -> None:
        key = str(store_id)
        for queue in self._connections.get(key, []):
            await queue.put({"event": event_type, "data": json.dumps(data)})

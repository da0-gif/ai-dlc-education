import os
import uuid as _uuid
import aiofiles
from app.exceptions import ValidationError
from app.config import settings

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}


class FileStorageService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir

    async def save(self, file) -> str:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationError(f"File type .{ext} not allowed")
        if hasattr(file, "size") and file.size and file.size > settings.MAX_FILE_SIZE:
            raise ValidationError("File too large (max 5MB)")

        os.makedirs(self.upload_dir, exist_ok=True)
        filename = f"{_uuid.uuid4()}.{ext}"
        path = os.path.join(self.upload_dir, filename)
        content = await file.read()
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)
        return f"/uploads/{filename}"

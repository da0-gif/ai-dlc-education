from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


# Auth
class AdminLoginRequest(BaseModel):
    slug: Optional[str] = ""
    username: str
    password: str

class TableLoginRequest(BaseModel):
    slug: str
    table_number: int
    password: str

class TokenResponse(BaseModel):
    token: str

class TableLoginResponse(BaseModel):
    token: str
    session_id: UUID
    table_id: UUID

# Store
class StoreCreate(BaseModel):
    name: str
    slug: str
    address: Optional[str] = None
    phone: Optional[str] = None

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    theme: Optional[str] = None

class StoreResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    address: Optional[str]
    phone: Optional[str]
    theme: str = "dark"
    class Config:
        from_attributes = True

# Admin
class AdminCreate(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: UUID
    username: str
    class Config:
        from_attributes = True

# Category
class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    sort_order: int
    class Config:
        from_attributes = True

# Menu
class MenuCreate(BaseModel):
    name: str
    price: int = Field(gt=0)
    description: Optional[str] = None
    category_id: UUID

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    is_sold_out: Optional[bool] = None

class MenuReorder(BaseModel):
    menu_ids: list[UUID]

class MenuResponse(BaseModel):
    id: UUID
    name: str
    price: int
    description: Optional[str]
    image_url: Optional[str]
    sort_order: int
    is_sold_out: bool
    category_id: UUID
    class Config:
        from_attributes = True

# Order
class OrderItemCreate(BaseModel):
    menu_id: UUID
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    session_id: UUID
    items: list[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    id: UUID
    menu_name: str
    quantity: int
    unit_price: int
    subtotal: int
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    order_number: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse] = []
    class Config:
        from_attributes = True

# Table
class TableCreate(BaseModel):
    table_number: int
    password: str

class TableUpdate(BaseModel):
    password: Optional[str] = None

class TableResponse(BaseModel):
    id: UUID
    table_number: int
    class Config:
        from_attributes = True

# Parking
class ParkingCreate(BaseModel):
    session_id: UUID
    plate_number: str

class ParkingUpdate(BaseModel):
    plate_number: str

class ParkingResponse(BaseModel):
    id: UUID
    plate_number: str
    session_id: UUID
    class Config:
        from_attributes = True

# DailySales
class DailySalesResponse(BaseModel):
    id: UUID
    sales_date: date
    total_amount: int
    order_count: int
    class Config:
        from_attributes = True

# OrderHistory
class OrderHistoryResponse(BaseModel):
    id: UUID
    order_data: dict
    total_amount: int
    completed_at: str
    class Config:
        from_attributes = True

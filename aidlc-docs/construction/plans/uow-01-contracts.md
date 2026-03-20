# Contract/Interface Definition - UOW-01

## Unit Context
- **Stories**: US-01~US-13
- **Dependencies**: PostgreSQL, bcrypt, PyJWT, SQLAlchemy Async
- **Database Entities**: Store, Admin, Category, Menu, Table, Session, Order, OrderItem, OrderHistory, Parking, DailySales

---

## Repository Layer

### StoreRepository
- `create(store: Store) -> Store`
- `find_by_id(id: UUID) -> Optional[Store]`
- `find_by_slug(slug: str) -> Optional[Store]`
- `find_all() -> list[Store]`
- `update(store: Store) -> Store`

### AdminRepository
- `create(admin: Admin) -> Admin`
- `find_by_store_and_username(store_id: UUID, username: str) -> Optional[Admin]`

### CategoryRepository
- `create(category: Category) -> Category`
- `find_by_store(store_id: UUID) -> list[Category]`
- `find_by_id(id: UUID) -> Optional[Category]`
- `update(category: Category) -> Category`
- `delete(id: UUID) -> None`
- `has_menus(category_id: UUID) -> bool`
- `max_sort_order(store_id: UUID) -> int`

### MenuRepository
- `create(menu: Menu) -> Menu`
- `find_by_store(store_id: UUID, category_id: Optional[UUID]) -> list[Menu]`
- `find_by_id(id: UUID) -> Optional[Menu]`
- `update(menu: Menu) -> Menu`
- `delete(id: UUID) -> None`
- `bulk_update_sort_order(menu_ids: list[UUID]) -> None`

### TableRepository
- `create(table: Table) -> Table`
- `find_by_store(store_id: UUID) -> list[Table]`
- `find_by_store_and_number(store_id: UUID, table_number: int) -> Optional[Table]`
- `find_by_id(id: UUID) -> Optional[Table]`
- `update(table: Table) -> Table`

### SessionRepository
- `create(session: Session) -> Session`
- `find_active_by_table(table_id: UUID) -> Optional[Session]`
- `find_by_id(id: UUID) -> Optional[Session]`
- `update(session: Session) -> Session`

### OrderRepository
- `create(order: Order) -> Order`
- `find_by_session(session_id: UUID) -> list[Order]`
- `find_by_id(id: UUID) -> Optional[Order]`
- `find_completed_by_session(session_id: UUID) -> list[Order]`
- `find_completed_by_store_and_date(store_id: UUID, date: date) -> list[Order]`
- `update(order: Order) -> Order`
- `delete(id: UUID) -> None`
- `max_order_number_today(store_id: UUID) -> int`

### OrderItemRepository
- `create_bulk(items: list[OrderItem]) -> list[OrderItem]`
- `find_by_order(order_id: UUID) -> list[OrderItem]`
- `find_by_orders(order_ids: list[UUID]) -> list[OrderItem]`
- `delete_by_order(order_id: UUID) -> None`

### OrderHistoryRepository
- `create(history: OrderHistory) -> OrderHistory`
- `find_by_table(store_id: UUID, table_id: UUID, date_filter: Optional[date]) -> list[OrderHistory]`

### ParkingRepository
- `create(parking: Parking) -> Parking`
- `find_by_session(session_id: UUID) -> Optional[Parking]`
- `update(parking: Parking) -> Parking`
- `delete_by_session(session_id: UUID) -> None`

### DailySalesRepository
- `upsert(daily_sales: DailySales) -> DailySales`
- `find_by_store_and_date(store_id: UUID, sales_date: date) -> Optional[DailySales]`

---

## Business Logic Layer

### AuthService
- `admin_login(slug: str, username: str, password: str) -> dict`
  - Returns: `{token: str}`
  - Raises: `NotFoundError(404)`, `AuthError(401)`, `RateLimitError(429)`
- `table_login(slug: str, table_number: int, password: str) -> dict`
  - Returns: `{token: str, session_id: UUID}`
  - Raises: `NotFoundError(404)`, `AuthError(401)`
- `verify_token(token: str) -> dict`
  - Returns: payload dict
  - Raises: `AuthError(401)`

### StoreService
- `create_store(name: str, slug: str, address: Optional[str], phone: Optional[str]) -> Store`
  - Raises: `ConflictError(409)`
- `update_store(store_id: UUID, data: dict) -> Store`
  - Raises: `NotFoundError(404)`
- `get_stores() -> list[Store]`

### AdminService
- `create_admin(store_id: UUID, username: str, password: str) -> Admin`
  - Raises: `ConflictError(409)`

### CategoryService
- `create_category(store_id: UUID, name: str) -> Category`
- `get_categories(store_id: UUID) -> list[Category]`
- `update_category(category_id: UUID, name: str) -> Category`
  - Raises: `NotFoundError(404)`
- `delete_category(category_id: UUID) -> None`
  - Raises: `NotFoundError(404)`, `BusinessError(400)`

### MenuService
- `create_menu(store_id: UUID, data: dict, image_file: Optional[UploadFile]) -> Menu`
  - Raises: `NotFoundError(404)`, `ValidationError(400)`
- `get_menus(store_id: UUID, category_id: Optional[UUID]) -> list[Menu]`
- `update_menu(menu_id: UUID, data: dict, image_file: Optional[UploadFile]) -> Menu`
  - Raises: `NotFoundError(404)`
- `delete_menu(menu_id: UUID) -> None`
  - Raises: `NotFoundError(404)`
- `reorder_menus(menu_ids: list[UUID]) -> None`

### OrderService
- `create_order(store_id: UUID, table_id: UUID, session_id: UUID, items: list[dict]) -> Order`
  - Raises: `ValidationError(400)`
- `get_orders(session_id: UUID) -> list[Order]`
- `update_order_status(order_id: UUID, new_status: str) -> Order`
  - Raises: `NotFoundError(404)`, `BusinessError(400)`
- `delete_order(order_id: UUID) -> None`
  - Raises: `NotFoundError(404)`

### TableService
- `create_table(store_id: UUID, table_number: int, password: str) -> Table`
- `get_tables(store_id: UUID) -> list[Table]`
- `complete_table(store_id: UUID, table_id: UUID) -> None`
  - Raises: `BusinessError(400)`
- `get_order_history(store_id: UUID, table_id: UUID, date_filter: Optional[date]) -> list[OrderHistory]`

### ParkingService
- `register_parking(store_id: UUID, table_id: UUID, session_id: UUID, plate_number: str) -> Parking`
  - Raises: `AuthError(403)`, `ValidationError(400)`
- `get_parking(session_id: UUID) -> Optional[Parking]`

### DailySalesService
- `close_daily_sales(store_id: UUID) -> DailySales`

### SSEService
- `connect(store_id: UUID) -> AsyncGenerator`
- `broadcast(store_id: UUID, event_type: str, data: dict) -> None`

### FileStorageService
- `save(file: UploadFile) -> str`
  - Returns: URL path
  - Raises: `ValidationError(400)`

---

## API Layer

### Auth Router (`/api/auth`)
- `POST /api/auth/admin/login` → `{token}`
- `POST /api/auth/table/login` → `{token, session_id}`

### Store Router (`/api/admin/stores`)
- `POST /api/admin/stores` → Store
- `PUT /api/admin/stores/{store_id}` → Store
- `GET /api/admin/stores` → Store[]

### Admin Router (`/api/admin/stores/{store_id}/admins`)
- `POST /api/admin/stores/{store_id}/admins` → Admin

### Category Router (`/api/admin/stores/{store_id}/categories`)
- `POST /api/admin/stores/{store_id}/categories` → Category
- `GET /api/stores/{store_id}/categories` → Category[]
- `PUT /api/admin/stores/{store_id}/categories/{category_id}` → Category
- `DELETE /api/admin/stores/{store_id}/categories/{category_id}`

### Menu Router
- `GET /api/stores/{store_id}/menus?category_id=` → Menu[]
- `POST /api/admin/stores/{store_id}/menus` → Menu
- `PUT /api/admin/stores/{store_id}/menus/{menu_id}` → Menu
- `DELETE /api/admin/stores/{store_id}/menus/{menu_id}`
- `PUT /api/admin/stores/{store_id}/menus/reorder`

### Order Router
- `POST /api/stores/{store_id}/tables/{table_id}/orders` → Order
- `GET /api/stores/{store_id}/tables/{table_id}/orders?session_id=` → Order[]
- `PUT /api/admin/orders/{order_id}/status` → Order
- `DELETE /api/admin/orders/{order_id}`

### Table Router
- `POST /api/admin/stores/{store_id}/tables` → Table
- `GET /api/admin/stores/{store_id}/tables` → Table[]
- `POST /api/admin/stores/{store_id}/tables/{table_id}/complete`
- `GET /api/admin/stores/{store_id}/tables/{table_id}/history?date=` → OrderHistory[]

### Parking Router
- `POST /api/stores/{store_id}/tables/{table_id}/parking` → Parking
- `PUT /api/stores/{store_id}/tables/{table_id}/parking/{parking_id}` → Parking
- `GET /api/stores/{store_id}/tables/{table_id}/parking?session_id=` → Parking | null

### SSE Router
- `GET /api/admin/stores/{store_id}/orders/stream` → SSE EventSource

### DailySales Router
- `POST /api/admin/stores/{store_id}/daily-sales/close` → DailySales

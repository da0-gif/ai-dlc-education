# Component Methods

> Note: 상세 비즈니스 로직은 Functional Design (Construction Phase)에서 정의

## Frontend

### FC-01: AuthProvider
- `tableLogin(storeId, tableNo, password) → {token, sessionId}`
- `adminLogin(storeId, username, password) → {jwtToken}`
- `autoLogin() → boolean`
- `logout() → void`
- `isAuthenticated() → boolean`

### FC-02: MenuView
- `fetchMenus(storeId, categoryId?) → Menu[]`
- `filterByCategory(categoryId) → void`
- `addToCart(menuItem) → void`

### FC-03: CartManager
- `addItem(menu) → void`
- `removeItem(menuId) → void`
- `updateQuantity(menuId, quantity) → void`
- `clearCart() → void`
- `getTotal() → number`
- `persistToStorage() → void`
- `loadFromStorage() → CartItem[]`

### FC-04: OrderFlow
- `createOrder(cartItems, sessionId) → Order`
- `fetchOrders(sessionId) → Order[]`
- `getOrderStatus(orderId) → OrderStatus`
- `hasCompletedOrder(sessionId) → boolean`

### FC-05: AdminDashboard
- `connectSSE(storeId) → EventSource`
- `fetchTableOrders(storeId) → TableOrder[]`
- `updateOrderStatus(orderId, status) → void`
- `filterByTable(tableId?) → void`

### FC-06: MenuManager
- `createMenu(menuData, imageFile?) → Menu`
- `updateMenu(menuId, menuData, imageFile?) → Menu`
- `deleteMenu(menuId) → void`
- `reorderMenus(menuIds[]) → void`

### FC-07: TableManager
- `setupTable(tableNo, password) → Table`
- `deleteOrder(orderId) → void`
- `completeTableSession(tableId) → void`
- `fetchOrderHistory(tableId, dateFilter?) → OrderHistory[]`

### FC-08: StoreManager
- `createStore(storeData) → Store`
- `updateStore(storeId, storeData) → Store`
- `fetchStores() → Store[]`

### FC-09: ParkingRegister
- `registerParking(sessionId, plateNumber) → Parking`
- `updateParking(parkingId, plateNumber) → Parking`
- `fetchParking(sessionId) → Parking | null`

---

## Backend

### BC-01: AuthModule
- `POST /api/auth/admin/login` → JWT token
- `POST /api/auth/table/login` → session token
- `verify_token(token) → payload` (middleware)

### BC-02: MenuModule
- `GET /api/stores/{storeId}/menus?category=` → Menu[]
- `POST /api/admin/stores/{storeId}/menus` → Menu (with image upload)
- `PUT /api/admin/stores/{storeId}/menus/{menuId}` → Menu
- `DELETE /api/admin/stores/{storeId}/menus/{menuId}` → void
- `PUT /api/admin/stores/{storeId}/menus/reorder` → void

### BC-03: OrderModule
- `POST /api/stores/{storeId}/tables/{tableId}/orders` → Order
- `GET /api/stores/{storeId}/tables/{tableId}/orders?sessionId=` → Order[]
- `PUT /api/admin/orders/{orderId}/status` → Order
- `DELETE /api/admin/orders/{orderId}` → void
- `GET /api/admin/stores/{storeId}/tables/{tableId}/history?date=` → OrderHistory[]

### BC-04: TableModule
- `POST /api/admin/stores/{storeId}/tables` → Table
- `PUT /api/admin/stores/{storeId}/tables/{tableId}` → Table
- `POST /api/admin/stores/{storeId}/tables/{tableId}/complete` → void
- `GET /api/admin/stores/{storeId}/tables` → Table[]

### BC-05: StoreModule
- `POST /api/admin/stores` → Store
- `PUT /api/admin/stores/{storeId}` → Store
- `GET /api/admin/stores` → Store[]

### BC-06: SSEModule
- `GET /api/admin/stores/{storeId}/orders/stream` → SSE EventSource
- `broadcast_order_event(storeId, event)` → internal

### BC-07: ParkingModule
- `POST /api/stores/{storeId}/tables/{tableId}/parking` → Parking
- `PUT /api/stores/{storeId}/tables/{tableId}/parking/{parkingId}` → Parking
- `GET /api/stores/{storeId}/tables/{tableId}/parking?sessionId=` → Parking | null

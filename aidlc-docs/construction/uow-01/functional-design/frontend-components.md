# Frontend Components - UOW-01

## 라우팅 구조

```
/                        → 테이블 로그인 (또는 자동 로그인 → /customer)
/customer                → 고객 메뉴 화면 (기본)
/customer/cart            → 장바구니
/customer/orders          → 주문 내역
/customer/parking         → 주차 등록
/admin/login              → 관리자 로그인
/admin                    → 관리자 대시보드
/admin/menus              → 메뉴 관리
/admin/tables             → 테이블 관리
/admin/stores             → 매장 관리
```

---

## Component Hierarchy

```
App
├── AuthProvider (Context)
├── Customer Routes (테이블 인증 필요)
│   ├── MenuView
│   │   └── MenuCard
│   ├── CartManager
│   │   └── CartItem
│   ├── OrderFlow
│   │   ├── OrderConfirm
│   │   └── OrderList
│   └── ParkingRegister
└── Admin Routes (JWT 인증 필요)
    ├── AdminDashboard
    │   ├── TableGrid
    │   ├── TableCard
    │   └── OrderDetailModal
    ├── MenuManager
    │   ├── MenuForm
    │   └── CategoryManager
    ├── TableManager
    │   ├── TableSetupForm
    │   └── OrderHistoryModal
    └── StoreManager
        └── StoreForm
```

---

## 주요 컴포넌트 상세

### AuthProvider
- **State**: `{token, sessionId, storeId, tableId, role, isAuthenticated}`
- **로직**: localStorage에서 토큰 로드 → 만료 확인 → 자동 로그인 또는 로그인 화면

### MenuView
- **Props**: -
- **State**: `{menus: Menu[], categories: Category[], selectedCategory: string | null}`
- **API**: `GET /api/stores/{storeId}/menus`
- **Action**: addToCart → CartManager state 업데이트

### CartManager
- **State**: `{items: CartItem[], total: number}` (localStorage 영속화)
- **CartItem**: `{menuId, menuName, unitPrice, quantity, subtotal}`
- **로직**: 동일 메뉴 추가 시 수량 증가, 수량 0 시 자동 삭제

### OrderFlow
- **API**: `POST /api/stores/{storeId}/tables/{tableId}/orders`, `GET .../orders?sessionId=`
- **로직**: 주문 확정 → 성공 시 장바구니 비우기 → 5초 후 메뉴 화면 리다이렉트
- **중복 클릭 방지**: 버튼 disabled 처리

### ParkingRegister
- **State**: `{plateNumber, existingParking, hasCompletedOrder}`
- **API**: `POST/PUT /api/stores/{storeId}/tables/{tableId}/parking`, `GET .../parking?sessionId=`
- **조건부 렌더링**: hasCompletedOrder === true일 때만 노출

### AdminDashboard
- **State**: `{tableOrders: TableOrder[], sseConnected: boolean}`
- **SSE**: `GET /api/admin/stores/{storeId}/orders/stream`
- **로직**: 신규 주문 시 카드 하이라이트, 상태 변경 버튼 (PENDING→PREPARING→COMPLETED)

### MenuManager
- **State**: `{menus: Menu[], categories: Category[], editingMenu: Menu | null}`
- **API**: CRUD endpoints + image upload (multipart/form-data)
- **CategoryManager**: 카테고리 추가/수정/삭제 (메뉴 있는 카테고리 삭제 불가 안내)

### TableManager
- **State**: `{tables: Table[], selectedTable: Table | null, orderHistory: OrderHistory[]}`
- **Actions**: 테이블 설정, 주문 삭제 (확인 팝업), 이용 완료 (확인 팝업), 과거 내역 조회
- **DailySales**: "일마감" 버튼 → `POST /api/admin/stores/{storeId}/daily-sales/close`

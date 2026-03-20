# Component Dependencies

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React SPA                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Customer  │ │  Admin   │ │   AuthProvider   │ │
│  │ /customer │ │  /admin  │ │   (Context)      │ │
│  └─────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│        │             │                │           │
│        └──────┬──────┘                │           │
│               │ HTTP/SSE              │           │
└───────────────┼───────────────────────┘           │
                │                                    │
┌───────────────┼────────────────────────────────────┐
│           FastAPI Server                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐ │
│  │  Auth  │ │  Menu  │ │ Order  │ │    SSE      │ │
│  │ Router │ │ Router │ │ Router │ │   Router    │ │
│  └───┬────┘ └───┬────┘ └───┬────┘ └──────┬──────┘ │
│      │          │          │              │        │
│  ┌───┴────┐ ┌───┴────┐ ┌───┴────┐ ┌──────┴──────┐ │
│  │  Auth  │ │  Menu  │ │ Order  │ │    SSE      │ │
│  │Service │ │Service │ │Service │ │  Service    │ │
│  └───┬────┘ └───┬────┘ └───┬────┘ └─────────────┘ │
│      │          │          │                       │
│  ┌───┴──────────┴──────────┴─────────────────────┐ │
│  │          SQLAlchemy ORM (Repositories)         │ │
│  └───────────────────┬───────────────────────────┘ │
└──────────────────────┼─────────────────────────────┘
                       │
              ┌────────┴────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

## Dependency Matrix

| Component | Depends On |
|-----------|-----------|
| AuthService | StoreRepo, TableRepo, bcrypt, JWT |
| MenuService | MenuRepo, FileStorageService |
| OrderService | OrderRepo, TableService, SSEService |
| TableService | TableRepo, OrderRepo, OrderHistoryRepo, SSEService |
| StoreService | StoreRepo, AuthService |
| SSEService | (standalone, in-memory) |
| FileStorageService | (standalone, filesystem) |
| ParkingService | ParkingRepo, OrderRepo |

## Data Flow

### 고객 주문 플로우
1. Customer UI → `POST /api/stores/{id}/tables/{id}/orders` → OrderService
2. OrderService → DB 저장 → SSEService.broadcast()
3. SSEService → Admin Dashboard (실시간 수신)

### 관리자 상태 변경 플로우
1. Admin UI → `PUT /api/admin/orders/{id}/status` → OrderService
2. OrderService → DB 업데이트 → SSEService.broadcast()
3. SSEService → Admin Dashboard (실시간 반영)

### 테이블 이용 완료 플로우
1. Admin UI → `POST /api/admin/stores/{id}/tables/{id}/complete` → TableService
2. TableService → 주문 → OrderHistory 이동 → 세션 종료 → SSEService.broadcast()

### 주차 차량 등록 플로우
1. Customer UI → 주문 완료 여부 확인 → 차량 등록 메뉴 노출
2. Customer UI → `POST /api/stores/{id}/tables/{id}/parking` → ParkingService
3. ParkingService → 주문 완료 확인 → 차량 번호 검증 → DB 저장 → 반환

## Communication Patterns
- **Frontend ↔ Backend**: REST API (HTTP JSON)
- **Backend → Frontend (실시간)**: SSE (Server-Sent Events)
- **Service ↔ Service**: 직접 함수 호출 (단일 프로세스)
- **Service ↔ DB**: SQLAlchemy ORM (async)

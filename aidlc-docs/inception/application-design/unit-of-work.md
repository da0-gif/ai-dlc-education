# Unit of Work

## 분해 전략
- **아키텍처**: 단일 모놀리식 (React SPA + FastAPI)
- **분해 기준**: 기능 도메인 기반 모듈
- **구현 방식**: 전체 동시 진행 (단일 Unit)

---

## Unit 정의

### UOW-01: 테이블오더 풀스택 애플리케이션
- **Type**: Monolith (Full-Stack)
- **Description**: 테이블오더 서비스 전체를 하나의 Unit으로 구현
- **Rationale**: 단일 React SPA + 단일 FastAPI 서버 구조이며, 전체 동시 진행으로 결정되어 하나의 Unit으로 통합

#### Frontend 모듈
| Module | Components | 역할 |
|--------|-----------|------|
| Auth | FC-01 AuthProvider | 테이블/관리자 인증 |
| Customer | FC-02 MenuView, FC-03 CartManager, FC-04 OrderFlow, FC-09 ParkingRegister | 고객 주문 여정 + 주차 등록 |
| Admin Dashboard | FC-05 AdminDashboard | 실시간 주문 모니터링 |
| Admin Management | FC-06 MenuManager, FC-07 TableManager, FC-08 StoreManager | 관리 기능 |

#### Backend 모듈
| Module | Components | Services | 역할 |
|--------|-----------|----------|------|
| Auth | BC-01 AuthModule | SVC-01 AuthService | 인증/인가 |
| Menu | BC-02 MenuModule | SVC-02 MenuService, SVC-07 FileStorageService | 메뉴 관리 |
| Order | BC-03 OrderModule | SVC-03 OrderService | 주문 처리 |
| Table | BC-04 TableModule | SVC-04 TableService | 테이블/세션 관리 |
| Store | BC-05 StoreModule | SVC-05 StoreService | 매장 관리 |
| SSE | BC-06 SSEModule | SVC-06 SSEService | 실시간 이벤트 |
| Parking | BC-07 ParkingModule | SVC-08 ParkingService | 주차 차량 등록 |

---

## 코드 구조

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── admin/
│   │   │   └── common/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── menu.py
│   │   │   ├── order.py
│   │   │   ├── table.py
│   │   │   ├── store.py
│   │   │   ├── sse.py
│   │   │   └── parking.py
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── main.py
│   │   └── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

# TDD Code Generation Plan - UOW-01

## Unit Context
- **Workspace Root**: /Users/wm-it-25-00146/ai-dlc-education
- **Project Type**: Greenfield
- **Stories**: US-01 ~ US-13
- **Tech Stack**: React + TypeScript (Frontend), Python FastAPI + SQLAlchemy Async (Backend), PostgreSQL

---

## Plan Step 0: Project Setup & Contract Skeletons
- [x] Backend 프로젝트 구조 생성 (backend/)
  - [x] requirements.txt, config.py, main.py
  - [x] models/ (SQLAlchemy 모델)
  - [x] schemas/ (Pydantic 스키마)
  - [x] repositories/ (Repository 스켈레톤)
  - [x] services/ (Service 스켈레톤 - NotImplementedError)
  - [x] routers/ (Router 스켈레톤)
  - [x] exceptions.py (커스텀 예외)
  - [x] auth.py (JWT/bcrypt 유틸)
- [ ] Frontend 프로젝트 구조 생성 (frontend/)
  - [ ] package.json, vite config, tsconfig
  - [ ] src/ 구조 (components, hooks, services, types)
- [x] Docker 설정 (docker-compose.yml, Dockerfiles)
- [x] 구문 검증

## Plan Step 1: Backend Business Logic Layer (TDD)

### 1.1 AuthService (US-01, US-06)
- [x] admin_login() - RED-GREEN-REFACTOR
  - [x] RED: TC-001 (로그인 성공)
  - [x] GREEN: 최소 구현
  - [x] RED: TC-002 (매장 없음)
  - [x] GREEN: NotFoundError 추가
  - [x] RED: TC-003 (비밀번호 불일치)
  - [x] GREEN: AuthError 추가
  - [x] RED: TC-004 (시도 횟수 초과)
  - [x] GREEN: RateLimitError 추가
  - [x] REFACTOR
  - [x] VERIFY: TC-001~004 전체 통과
- [x] table_login() - RED-GREEN-REFACTOR
  - [x] RED: TC-005 (로그인 성공)
  - [x] GREEN: 최소 구현
  - [x] RED: TC-006 (기존 세션 재사용)
  - [x] GREEN: 세션 조회 로직
  - [x] RED: TC-007 (비밀번호 불일치)
  - [x] GREEN: AuthError 추가
  - [x] REFACTOR
  - [x] VERIFY: TC-005~007 전체 통과

### 1.2 StoreService (US-07)
- [x] create_store() - RED-GREEN-REFACTOR
  - [x] RED: TC-008, GREEN, RED: TC-009, GREEN
  - [x] REFACTOR & VERIFY

### 1.3 AdminService (US-07)
- [x] create_admin() - RED-GREEN-REFACTOR
  - [x] RED: TC-010, GREEN, RED: TC-011, GREEN
  - [x] REFACTOR & VERIFY

### 1.4 CategoryService (US-12)
- [x] create_category(), delete_category() - RED-GREEN-REFACTOR
  - [x] RED: TC-012, GREEN, RED: TC-013, GREEN, RED: TC-014, GREEN
  - [x] REFACTOR & VERIFY

### 1.5 MenuService (US-12)
- [x] create_menu(), reorder_menus() - RED-GREEN-REFACTOR
  - [x] RED: TC-015, GREEN, RED: TC-016, GREEN, RED: TC-017, GREEN
  - [x] REFACTOR & VERIFY

### 1.6 OrderService (US-04, US-09, US-10)
- [x] create_order() - RED-GREEN-REFACTOR
  - [x] RED: TC-018, GREEN, RED: TC-019, GREEN
  - [x] REFACTOR & VERIFY
- [x] update_order_status() - RED-GREEN-REFACTOR
  - [x] RED: TC-020, GREEN, RED: TC-021, GREEN
  - [x] REFACTOR & VERIFY
- [x] delete_order() - RED-GREEN-REFACTOR
  - [x] RED: TC-022, GREEN
  - [x] REFACTOR & VERIFY

### 1.7 TableService (US-10, US-11)
- [x] complete_table() - RED-GREEN-REFACTOR
  - [x] RED: TC-023, GREEN, RED: TC-024, GREEN, RED: TC-025, GREEN
  - [x] REFACTOR & VERIFY
- [x] get_order_history() - RED-GREEN-REFACTOR
  - [x] RED: TC-026, GREEN
  - [x] REFACTOR & VERIFY

### 1.8 ParkingService (US-13)
- [x] register_parking() - RED-GREEN-REFACTOR
  - [x] RED: TC-027, GREEN, RED: TC-028, GREEN, RED: TC-029, GREEN, RED: TC-030, GREEN
  - [x] REFACTOR & VERIFY

### 1.9 DailySalesService (FR-11)
- [x] close_daily_sales() - RED-GREEN-REFACTOR
  - [x] RED: TC-031, GREEN, RED: TC-032, GREEN
  - [x] REFACTOR & VERIFY

### 1.10 FileStorageService (US-12)
- [x] save() - RED-GREEN-REFACTOR
  - [x] RED: TC-033, GREEN, RED: TC-034, GREEN, RED: TC-035, GREEN
  - [x] REFACTOR & VERIFY

## Plan Step 2: Backend API Layer (TDD)
- [x] Auth Router - 엔드포인트 테스트 + 구현
- [x] Store Router - 엔드포인트 테스트 + 구현
- [x] Admin Router - 엔드포인트 테스트 + 구현
- [x] Category Router - 엔드포인트 테스트 + 구현
- [x] Menu Router - 엔드포인트 테스트 + 구현
- [x] Order Router - 엔드포인트 테스트 + 구현
- [x] Table Router - 엔드포인트 테스트 + 구현
- [x] Parking Router - 엔드포인트 테스트 + 구현
- [x] SSE Router - 엔드포인트 테스트 + 구현
- [x] DailySales Router - 엔드포인트 테스트 + 구현

## Plan Step 3: Backend Repository Layer (TDD)
- [x] SQLAlchemy 모델 정의 (models/)
- [x] Alembic migration 설정 + 초기 마이그레이션
- [x] Repository 구현 (각 Repository TDD)

## Plan Step 4: Frontend (React + TypeScript)
- [x] 프로젝트 초기화 (Vite + React + TypeScript)
- [x] 공통 타입 정의 (types/)
- [x] API 서비스 레이어 (services/)
- [x] AuthProvider (Context)
- [x] Customer 컴포넌트 (MenuView, CartManager, OrderFlow, ParkingRegister)
- [x] Admin 컴포넌트 (AdminDashboard, MenuManager, TableManager, StoreManager)
- [x] 라우팅 설정

## Plan Step 5: Deployment & Documentation
- [x] Dockerfile (frontend, backend)
- [x] docker-compose.yml
- [ ] README.md 업데이트
- [x] API 문서 (자동 생성 - FastAPI Swagger)

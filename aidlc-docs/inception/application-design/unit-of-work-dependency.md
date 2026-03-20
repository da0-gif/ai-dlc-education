# Unit of Work Dependency

## Unit 구성
단일 Unit(UOW-01)이므로 Unit 간 의존성은 없습니다.
아래는 Unit 내부 모듈 간 의존성입니다.

---

## Backend 모듈 의존성

| Module | 의존 대상 |
|--------|----------|
| AuthModule | StoreModule |
| MenuModule | FileStorageService |
| OrderModule | TableModule, SSEModule |
| TableModule | OrderModule (history), SSEModule |
| StoreModule | AuthModule (계정 생성) |
| ParkingModule | OrderModule (완료 확인) |
| SSEModule | (독립) |

## Frontend → Backend 의존성

| Frontend Module | Backend API |
|----------------|-------------|
| Auth (FC-01) | AuthModule API |
| Customer (FC-02~04, FC-09) | MenuModule, OrderModule, ParkingModule API |
| Admin Dashboard (FC-05) | OrderModule, SSEModule API |
| Admin Management (FC-06~08) | MenuModule, TableModule, StoreModule API |

---

## 구현 참고사항
- 단일 Unit이므로 모든 모듈을 동시에 구현
- Backend 모듈은 같은 프로세스 내 직접 함수 호출
- 순환 의존성 주의: StoreModule ↔ AuthModule (매장 생성 시 관리자 계정 생성)

# Services

## Service Layer (Backend)

### SVC-01: AuthService
- **Purpose**: 인증 비즈니스 로직
- **Orchestration**:
  - 관리자 로그인: 자격 증명 검증 → JWT 생성 → 반환
  - 테이블 로그인: 테이블 검증 → 세션 토큰 생성 → 반환
- **Dependencies**: StoreRepository, TableRepository, JWT library, bcrypt

### SVC-02: MenuService
- **Purpose**: 메뉴 비즈니스 로직
- **Orchestration**:
  - 메뉴 조회: 매장별 카테고리 필터링 → 노출 순서 정렬 → 반환
  - 메뉴 등록: 검증 → 이미지 저장 → DB 저장 → 반환
- **Dependencies**: MenuRepository, FileStorageService

### SVC-03: OrderService
- **Purpose**: 주문 비즈니스 로직
- **Orchestration**:
  - 주문 생성: 검증 → DB 저장 → SSE 이벤트 발행 → 반환
  - 상태 변경: 검증 → DB 업데이트 → SSE 이벤트 발행
  - 주문 삭제: 검증 → DB 삭제 → 테이블 총액 재계산 → SSE 이벤트 발행
- **Dependencies**: OrderRepository, TableService, SSEService

### SVC-04: TableService
- **Purpose**: 테이블/세션 비즈니스 로직
- **Orchestration**:
  - 이용 완료: 현재 주문 → OrderHistory 이동 → 세션 종료 → 리셋 → SSE 이벤트 발행
  - 세션 시작: 첫 주문 시 자동 생성
- **Dependencies**: TableRepository, OrderRepository, OrderHistoryRepository, SSEService

### SVC-05: StoreService
- **Purpose**: 매장 비즈니스 로직
- **Orchestration**:
  - 매장 등록: 중복 검증 → DB 저장 → 관리자 계정 생성
- **Dependencies**: StoreRepository, AuthService

### SVC-06: SSEService
- **Purpose**: 실시간 이벤트 관리
- **Orchestration**:
  - 연결 관리: 매장별 클라이언트 연결 풀 관리
  - 이벤트 발행: 주문 생성/상태변경/삭제 이벤트를 해당 매장 구독자에게 전송
- **Dependencies**: In-memory connection pool

### SVC-07: FileStorageService
- **Purpose**: 파일 업로드 관리
- **Orchestration**:
  - 이미지 저장: 파일 검증 → 서버 로컬 저장 → URL 반환
- **Dependencies**: Local filesystem

### SVC-08: ParkingService
- **Purpose**: 주차 차량 등록 비즈니스 로직
- **Orchestration**:
  - 차량 등록: 주문 완료 여부 확인 → 차량 번호 검증 → DB 저장 → 반환
  - 차량 수정: 기존 등록 확인 → 차량 번호 검증 → DB 업데이트 → 반환
- **Dependencies**: ParkingRepository, OrderRepository

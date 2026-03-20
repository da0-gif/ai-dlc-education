# Components

## Frontend Components

### FC-01: AuthProvider
- **Purpose**: 테이블/관리자 인증 상태 관리
- **Responsibilities**:
  - 테이블 자동 로그인 (localStorage 기반)
  - 관리자 JWT 토큰 관리
  - 인증 상태에 따른 라우팅 가드

### FC-02: MenuView
- **Purpose**: 메뉴 조회 및 탐색
- **Responsibilities**:
  - 카테고리별 메뉴 목록 표시
  - 메뉴 카드 레이아웃 렌더링
  - 카테고리 필터링

### FC-03: CartManager
- **Purpose**: 장바구니 상태 관리
- **Responsibilities**:
  - 메뉴 추가/삭제/수량 조절
  - 총 금액 계산
  - localStorage 영속화

### FC-04: OrderFlow
- **Purpose**: 주문 생성 및 내역 조회
- **Responsibilities**:
  - 주문 확정 및 서버 전송
  - 주문 성공/실패 처리
  - 주문 내역 목록 표시
  - 주문 완료 후 차량 등록 안내

### FC-05: AdminDashboard
- **Purpose**: 실시간 주문 모니터링
- **Responsibilities**:
  - SSE 연결 및 실시간 주문 수신
  - 테이블별 그리드 카드 렌더링
  - 주문 상태 변경
  - 신규 주문 시각적 강조

### FC-06: MenuManager
- **Purpose**: 메뉴 CRUD 관리
- **Responsibilities**:
  - 메뉴 등록/수정/삭제
  - 이미지 파일 업로드
  - 노출 순서 조정

### FC-07: TableManager
- **Purpose**: 테이블 및 세션 관리
- **Responsibilities**:
  - 테이블 설정
  - 주문 삭제
  - 이용 완료 처리
  - 과거 주문 내역 조회

### FC-08: StoreManager
- **Purpose**: 매장 등록 및 관리
- **Responsibilities**:
  - 매장 CRUD
  - 다중 매장 전환

### FC-09: ParkingRegister
- **Purpose**: 무료 주차 차량 번호 등록
- **Responsibilities**:
  - 주문 완료 여부 확인 후 등록 메뉴 노출
  - 차량 번호 입력/수정
  - 등록 상태 표시

---

## Backend Components

### BC-01: AuthModule
- **Purpose**: 인증/인가 처리
- **Responsibilities**:
  - 관리자 로그인 (JWT 발급)
  - 테이블 로그인 (세션 토큰 발급)
  - 토큰 검증 미들웨어

### BC-02: MenuModule
- **Purpose**: 메뉴 데이터 관리
- **Responsibilities**:
  - 메뉴 CRUD API
  - 카테고리별 조회
  - 이미지 파일 저장

### BC-03: OrderModule
- **Purpose**: 주문 처리
- **Responsibilities**:
  - 주문 생성
  - 주문 상태 변경
  - 주문 삭제
  - 주문 조회 (현재 세션/과거 이력)

### BC-04: TableModule
- **Purpose**: 테이블/세션 관리
- **Responsibilities**:
  - 테이블 CRUD
  - 세션 시작/종료
  - 이용 완료 처리 (주문 이력 이동)

### BC-05: StoreModule
- **Purpose**: 매장 데이터 관리
- **Responsibilities**:
  - 매장 CRUD
  - 매장별 데이터 분리

### BC-07: ParkingModule
- **Purpose**: 주차 차량 등록 관리
- **Responsibilities**:
  - 차량 번호 등록/수정 API
  - 차량 번호 형식 검증
  - 세션별 차량 등록 조회

### BC-06: SSEModule
- **Purpose**: 실시간 이벤트 전송
- **Responsibilities**:
  - SSE 연결 관리
  - 신규 주문 이벤트 브로드캐스트
  - 주문 상태 변경 이벤트 전송

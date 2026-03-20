# Functional Design Plan - UOW-01 (테이블오더 풀스택)

## 실행 계획

### Part 1: Domain Entities 설계
- [x] 핵심 엔티티 정의 (Store, Admin, Table, Session, Menu, Category, Order, OrderItem, OrderHistory, Parking)
- [x] 엔티티 간 관계 및 ERD 정의
- [x] `domain-entities.md` 생성

### Part 2: Business Rules 설계
- [x] 인증 규칙 (테이블 자동 로그인, 관리자 JWT, 세션 만료)
- [x] 주문 규칙 (생성, 상태 전이, 삭제, 금액 계산)
- [x] 테이블 관리 규칙 (이용 완료, 세션 리셋, 이력 이동)
- [x] 메뉴 관리 규칙 (CRUD, 검증, 이미지, 노출 순서)
- [x] 주차 등록 규칙 (주문 완료 조건, 차량 번호 검증)
- [x] `business-rules.md` 생성

### Part 3: Business Logic Model 설계
- [x] 서비스별 상세 비즈니스 로직 흐름
- [x] 에러 처리 및 예외 시나리오
- [x] `business-logic-model.md` 생성

### Part 4: Frontend Components 설계
- [x] 컴포넌트 계층 구조 및 Props/State 정의
- [x] 사용자 인터랙션 흐름
- [x] API 연동 포인트
- [x] `frontend-components.md` 생성

---

## 질문

### Question 1
주문 상태 전이에서 "완료" 이후 추가 상태가 필요합니까?

A) 대기중 → 준비중 → 완료 (3단계, 현재 요구사항 그대로)
B) 대기중 → 준비중 → 완료 → 수령완료 (4단계, 고객 수령 확인 추가)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
일별 매출 집계(FR-11)의 "업무 종료 시 자동화"는 어떤 방식을 원하십니까?

A) 관리자가 "일마감" 버튼을 클릭하면 해당 시점까지의 매출을 집계
B) 매일 특정 시간(예: 자정)에 자동으로 집계 (스케줄러)
C) 테이블 이용 완료 시마다 실시간으로 누적 집계
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
차량 번호 등록(US-13)에서 "주문 완료" 조건의 기준은 무엇입니까?

A) 해당 테이블 세션에서 1건 이상의 주문 상태가 "완료"인 경우
B) 해당 테이블 세션에서 주문이 1건 이상 존재하면 (상태 무관)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
카테고리는 어떻게 관리됩니까?

A) 고정 카테고리 (시스템에서 미리 정의, 예: 메인/사이드/음료/디저트)
B) 관리자가 카테고리를 자유롭게 추가/수정/삭제 가능
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5
매장 등록 시 관리자 계정은 어떻게 생성됩니까?

A) 매장 등록과 동시에 기본 관리자 계정 1개 자동 생성 (매장당 1계정)
B) 매장 등록 후 별도로 관리자 계정을 생성하는 단계가 필요
C) Other (please describe after [Answer]: tag below)

[Answer]: B

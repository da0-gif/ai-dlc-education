# Test Plan - UOW-01

## Unit Overview
- **Unit**: UOW-01 (테이블오더 풀스택)
- **Stories**: US-01 ~ US-13
- **Approach**: TDD (RED-GREEN-REFACTOR)

---

## Business Logic Layer Tests

### AuthService

#### AuthService.admin_login()
- **TC-001**: 유효한 자격 증명으로 관리자 로그인 성공
  - Given: 매장(slug="test-store")과 관리자(username="admin", password="pass123") 존재
  - When: admin_login("test-store", "admin", "pass123")
  - Then: JWT 토큰 반환
  - Story: US-06 | Status: ⬜

- **TC-002**: 존재하지 않는 매장 slug로 로그인 시도
  - Given: slug="nonexistent" 매장 없음
  - When: admin_login("nonexistent", "admin", "pass")
  - Then: NotFoundError(404) 발생
  - Story: US-06 | Status: ⬜

- **TC-003**: 잘못된 비밀번호로 로그인 시도
  - Given: 매장과 관리자 존재, 비밀번호 불일치
  - When: admin_login("test-store", "admin", "wrong")
  - Then: AuthError(401) 발생
  - Story: US-06 | Status: ⬜

- **TC-004**: 5회 실패 후 로그인 시도 차단
  - Given: 5회 연속 로그인 실패
  - When: 6번째 로그인 시도
  - Then: RateLimitError(429) 발생
  - Story: US-06 | Status: ⬜

#### AuthService.table_login()
- **TC-005**: 유효한 정보로 테이블 로그인 성공
  - Given: 매장, 테이블(number=1, password="1234") 존재
  - When: table_login("test-store", 1, "1234")
  - Then: token + session_id 반환
  - Story: US-01 | Status: ⬜

- **TC-006**: Active session 있을 때 기존 세션 재사용
  - Given: 테이블에 active session 존재
  - When: table_login 호출
  - Then: 기존 session_id 반환
  - Story: US-01 | Status: ⬜

- **TC-007**: 잘못된 테이블 비밀번호
  - Given: 테이블 존재, 비밀번호 불일치
  - When: table_login("test-store", 1, "wrong")
  - Then: AuthError(401) 발생
  - Story: US-01 | Status: ⬜

### StoreService

- **TC-008**: 매장 생성 성공
  - Given: slug="new-store" 미존재
  - When: create_store("새매장", "new-store")
  - Then: Store 반환, slug="new-store"
  - Story: US-07 | Status: ⬜

- **TC-009**: 중복 slug로 매장 생성 시도
  - Given: slug="existing" 이미 존재
  - When: create_store("매장", "existing")
  - Then: ConflictError(409) 발생
  - Story: US-07 | Status: ⬜

### AdminService

- **TC-010**: 관리자 계정 생성 성공
  - Given: store_id 존재, username="admin1" 미존재
  - When: create_admin(store_id, "admin1", "password")
  - Then: Admin 반환, password_hash는 bcrypt
  - Story: US-07 | Status: ⬜

- **TC-011**: 중복 username으로 관리자 생성 시도
  - Given: store_id + username="admin1" 이미 존재
  - When: create_admin(store_id, "admin1", "pass")
  - Then: ConflictError(409) 발생
  - Story: US-07 | Status: ⬜

### CategoryService

- **TC-012**: 카테고리 생성 성공
  - Given: store_id 존재
  - When: create_category(store_id, "메인메뉴")
  - Then: Category 반환, sort_order 자동 설정
  - Story: US-12 | Status: ⬜

- **TC-013**: 메뉴 있는 카테고리 삭제 시도
  - Given: 카테고리에 메뉴 1개 이상 존재
  - When: delete_category(category_id)
  - Then: BusinessError(400) 발생
  - Story: US-12 | Status: ⬜

- **TC-014**: 빈 카테고리 삭제 성공
  - Given: 카테고리에 메뉴 없음
  - When: delete_category(category_id)
  - Then: 삭제 성공
  - Story: US-12 | Status: ⬜

### MenuService

- **TC-015**: 메뉴 생성 성공 (이미지 포함)
  - Given: store_id, category_id 존재, 유효한 데이터
  - When: create_menu(store_id, {name, price, category_id}, image_file)
  - Then: Menu 반환, image_url 설정됨
  - Story: US-12 | Status: ⬜

- **TC-016**: price <= 0으로 메뉴 생성 시도
  - Given: price=0
  - When: create_menu(store_id, {name, price:0, category_id})
  - Then: ValidationError(400) 발생
  - Story: US-12 | Status: ⬜

- **TC-017**: 메뉴 노출 순서 변경
  - Given: 메뉴 3개 존재
  - When: reorder_menus([id3, id1, id2])
  - Then: sort_order가 0, 1, 2로 업데이트
  - Story: US-12 | Status: ⬜

### OrderService

- **TC-018**: 주문 생성 성공
  - Given: 유효한 store_id, table_id, session_id, items
  - When: create_order(store_id, table_id, session_id, items)
  - Then: Order 반환, status=PENDING, order_number 자동 설정, SSE 이벤트 발행
  - Story: US-04 | Status: ⬜

- **TC-019**: 빈 items로 주문 생성 시도
  - Given: items=[]
  - When: create_order(store_id, table_id, session_id, [])
  - Then: ValidationError(400) 발생
  - Story: US-04 | Status: ⬜

- **TC-020**: 주문 상태 PENDING → PREPARING 변경
  - Given: status=PENDING인 주문 존재
  - When: update_order_status(order_id, "PREPARING")
  - Then: status=PREPARING, SSE 이벤트 발행
  - Story: US-09 | Status: ⬜

- **TC-021**: 주문 상태 역방향 변경 시도 (COMPLETED → PREPARING)
  - Given: status=COMPLETED인 주문
  - When: update_order_status(order_id, "PREPARING")
  - Then: BusinessError(400) 발생
  - Story: US-09 | Status: ⬜

- **TC-022**: 주문 삭제 성공
  - Given: 주문 존재
  - When: delete_order(order_id)
  - Then: Order + OrderItem 삭제, SSE 이벤트 발행
  - Story: US-10 | Status: ⬜

### TableService

- **TC-023**: 테이블 이용 완료 성공
  - Given: active session에 주문 2건 존재
  - When: complete_table(store_id, table_id)
  - Then: OrderHistory 생성, Order/OrderItem 삭제, Session 종료, SSE 이벤트 발행
  - Story: US-10 | Status: ⬜

- **TC-024**: active session 없는 테이블 이용 완료 시도
  - Given: active session 없음
  - When: complete_table(store_id, table_id)
  - Then: BusinessError(400) 발생
  - Story: US-10 | Status: ⬜

- **TC-025**: 주문 없는 테이블 이용 완료
  - Given: active session 있지만 주문 없음
  - When: complete_table(store_id, table_id)
  - Then: Session 종료 성공 (OrderHistory는 빈 데이터)
  - Story: US-10 | Status: ⬜

- **TC-026**: 과거 주문 내역 날짜 필터 조회
  - Given: OrderHistory 3건 (날짜 다름)
  - When: get_order_history(store_id, table_id, date_filter="2026-03-20")
  - Then: 해당 날짜 이력만 반환
  - Story: US-11 | Status: ⬜

### ParkingService

- **TC-027**: 주차 등록 성공
  - Given: active session, COMPLETED 주문 1건 이상, 유효한 차량 번호
  - When: register_parking(store_id, table_id, session_id, "12가3456")
  - Then: Parking 반환
  - Story: US-13 | Status: ⬜

- **TC-028**: COMPLETED 주문 없이 주차 등록 시도
  - Given: active session, COMPLETED 주문 없음
  - When: register_parking(store_id, table_id, session_id, "12가3456")
  - Then: AuthError(403) 발생
  - Story: US-13 | Status: ⬜

- **TC-029**: 잘못된 차량 번호 형식
  - Given: COMPLETED 주문 존재
  - When: register_parking(store_id, table_id, session_id, "invalid")
  - Then: ValidationError(400) 발생
  - Story: US-13 | Status: ⬜

- **TC-030**: 기존 주차 등록 수정
  - Given: 세션에 이미 Parking 등록됨
  - When: register_parking(store_id, table_id, session_id, "34나5678")
  - Then: 기존 Parking 업데이트
  - Story: US-13 | Status: ⬜

### DailySalesService

- **TC-031**: 일마감 성공
  - Given: 오늘 COMPLETED 주문 3건 (총 45000원)
  - When: close_daily_sales(store_id)
  - Then: DailySales(total_amount=45000, order_count=3) 반환
  - Story: FR-11 | Status: ⬜

- **TC-032**: 일마감 재실행 (덮어쓰기)
  - Given: 오늘 이미 마감됨, 이후 추가 주문 발생
  - When: close_daily_sales(store_id)
  - Then: 기존 DailySales 업데이트 (추가 주문 포함)
  - Story: FR-11 | Status: ⬜

### FileStorageService

- **TC-033**: 이미지 저장 성공
  - Given: 유효한 jpg 파일 (< 5MB)
  - When: save(file)
  - Then: URL path 반환
  - Story: US-12 | Status: ⬜

- **TC-034**: 허용되지 않는 확장자
  - Given: .exe 파일
  - When: save(file)
  - Then: ValidationError(400) 발생
  - Story: US-12 | Status: ⬜

- **TC-035**: 5MB 초과 파일
  - Given: 6MB 파일
  - When: save(file)
  - Then: ValidationError(400) 발생
  - Story: US-12 | Status: ⬜

---

## Requirements Coverage

| Requirement | Test Cases | Status |
|------------|------------|--------|
| FR-01 (테이블 로그인) | TC-005, TC-006, TC-007 | ⬜ |
| FR-02 (메뉴 조회) | TC-015, TC-017 | ⬜ |
| FR-03 (장바구니) | Frontend only | ⬜ |
| FR-04 (주문 생성) | TC-018, TC-019 | ⬜ |
| FR-05 (주문 내역) | TC-018 | ⬜ |
| FR-06 (관리자 인증) | TC-001~TC-004 | ⬜ |
| FR-07 (실시간 모니터링) | TC-018, TC-020 (SSE) | ⬜ |
| FR-08 (테이블 관리) | TC-023~TC-026 | ⬜ |
| FR-09 (메뉴 관리) | TC-012~TC-017 | ⬜ |
| FR-10 (매장 관리) | TC-008~TC-011 | ⬜ |
| FR-11 (일별 매출) | TC-031, TC-032 | ⬜ |
| FR-12 (주차 등록) | TC-027~TC-030 | ⬜ |

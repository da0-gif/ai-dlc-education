# Business Logic Model - UOW-01

## AuthService

### adminLogin(slug, username, password)
1. Store 조회 by slug → 없으면 404
2. Admin 조회 by store_id + username → 없으면 401
3. 로그인 시도 횟수 확인 → 5회 초과 & 15분 미경과 시 429
4. bcrypt.verify(password, password_hash) → 실패 시 시도 횟수 증가, 401
5. JWT 생성 (payload: admin_id, store_id, exp: 16h)
6. 시도 횟수 리셋
7. Return JWT

### tableLogin(slug, tableNumber, password)
1. Store 조회 by slug → 없으면 404
2. Table 조회 by store_id + table_number → 없으면 404
3. password 비교 (평문) → 불일치 시 401
4. Active Session 조회 → 없으면 새 Session 생성
5. 세션 토큰 생성 (payload: table_id, session_id, store_id, exp: 16h)
6. Return token + session_id

---

## MenuService

### getMenus(storeId, categoryId?)
1. categoryId 있으면 해당 카테고리만, 없으면 전체
2. sort_order ASC 정렬
3. Return Menu[]

### createMenu(storeId, menuData, imageFile?)
1. 필수 필드 검증 (name, price, category_id)
2. price > 0 검증
3. Category 존재 확인
4. imageFile 있으면 → FileStorageService.save() → image_url
5. DB 저장, Return Menu

### deleteMenu(menuId)
1. Menu 존재 확인 → 없으면 404
2. DB 삭제 (기존 OrderItem 스냅샷은 영향 없음)

### reorderMenus(menuIds[])
1. 배열 순서대로 sort_order 업데이트

---

## CategoryService

### createCategory(storeId, name)
1. DB 저장 (sort_order = max + 1), Return Category

### deleteCategory(categoryId)
1. 해당 카테고리에 메뉴 존재 확인 → 있으면 400
2. DB 삭제

---

## OrderService

### createOrder(storeId, tableId, sessionId, items[])
1. items 비어있으면 → 400
2. 각 item의 Menu 조회 → menu_name, unit_price 스냅샷
3. subtotal = unit_price × quantity, total_amount = sum(subtotal)
4. Order 생성 (status: PENDING, order_number: 당일 매장 max+1)
5. OrderItem[] 생성
6. SSEService.broadcast(storeId, "order:created", order)
7. Return Order

### updateOrderStatus(orderId, newStatus)
1. Order 조회 → 없으면 404
2. 상태 전이 검증: PENDING→PREPARING, PREPARING→COMPLETED만 허용 → 그 외 400
3. status 업데이트
4. SSEService.broadcast(storeId, "order:status_changed", order)
5. Return Order

### deleteOrder(orderId)
1. Order 조회 → 없으면 404
2. OrderItem 삭제 → Order 삭제
3. SSEService.broadcast(storeId, "order:deleted", {orderId, tableId})

---

## TableService

### completeTable(storeId, tableId)
1. Active Session 조회 → 없으면 400
2. 세션의 모든 Order + OrderItem 조회
3. Parking 정보 조회 (있으면 포함)
4. OrderHistory 생성 (order_data: JSON 스냅샷, completed_at: now)
5. Order + OrderItem 삭제, Parking 삭제
6. Session 종료 (is_active=false, ended_at=now)
7. SSEService.broadcast(storeId, "table:completed", {tableId})

### getOrderHistory(storeId, tableId, dateFilter?)
1. OrderHistory 조회 by store_id + table_id
2. dateFilter 있으면 completed_at 기준 필터
3. 시간 역순 정렬, Return OrderHistory[]

---

## StoreService

### createStore(storeData)
1. slug 중복 확인 → 중복 시 409
2. DB 저장, Return Store

---

## AdminService

### createAdmin(storeId, username, password)
1. store_id + username 중복 확인 → 중복 시 409
2. password_hash = bcrypt.hash(password)
3. DB 저장, Return Admin

---

## ParkingService

### registerParking(storeId, tableId, sessionId, plateNumber)
1. Session 조회 → active 확인
2. 해당 세션에 COMPLETED 주문 존재 확인 → 없으면 403
3. 차량 번호 형식 검증 → 실패 시 400
4. 기존 Parking 확인 → 있으면 업데이트, 없으면 생성
5. Return Parking

### getParking(sessionId)
1. Parking 조회 by session_id, Return Parking | null

---

## DailySalesService

### closeDailySales(storeId)
1. 오늘 날짜의 COMPLETED 주문 조회
2. total_amount = sum(order.total_amount), order_count = count
3. DailySales upsert (store_id + sales_date 기준, 재마감 시 덮어쓰기)
4. Return DailySales

---

## SSEService

### connect(storeId)
1. 매장별 연결 풀에 클라이언트 추가
2. keep-alive 주기적 전송

### broadcast(storeId, eventType, data)
1. 해당 매장 연결 풀의 모든 클라이언트에 이벤트 전송
2. 끊긴 클라이언트는 풀에서 제거

---

## FileStorageService

### save(file)
1. 확장자 검증 (jpg, jpeg, png, gif, webp)
2. 크기 검증 (max 5MB)
3. UUID 기반 파일명 생성, 로컬 저장
4. Return URL path

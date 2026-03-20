# Integration Test Instructions

## 목적
Frontend ↔ Backend ↔ DB 간 통합 동작을 검증합니다.

## 사전 조건
```bash
docker compose up -d
# 모든 서비스 running 확인
docker compose ps
```

## Test Scenarios

### Scenario 1: 매장 등록 → 관리자 생성 → 로그인
```bash
# 1. 매장 등록
curl -s -X POST http://localhost:8000/api/stores \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트매장","slug":"test-store"}' | python3 -m json.tool

# 2. 관리자 생성 (store_id를 위 응답에서 확인)
curl -s -X POST http://localhost:8000/api/stores/{store_id}/admins \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass123"}' | python3 -m json.tool

# 3. 관리자 로그인
curl -s -X POST http://localhost:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"store_slug":"test-store","username":"admin","password":"pass123"}' | python3 -m json.tool
# Expected: {"access_token":"...","token_type":"bearer"}
```

### Scenario 2: 카테고리 → 메뉴 → 테이블 설정
```bash
# 1. 카테고리 생성 (admin token 필요)
TOKEN="Bearer <위에서_받은_토큰>"

curl -s -X POST http://localhost:8000/api/stores/{store_id}/categories \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"메인메뉴"}' | python3 -m json.tool

# 2. 메뉴 생성
curl -s -X POST http://localhost:8000/api/stores/{store_id}/menus \
  -H "Authorization: $TOKEN" \
  -F "name=김치찌개" -F "price=9000" -F "category_id={category_id}" | python3 -m json.tool

# 3. 테이블 생성
curl -s -X POST http://localhost:8000/api/stores/{store_id}/tables \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_number":1,"password":"1234"}' | python3 -m json.tool
```

### Scenario 3: 고객 주문 플로우
```bash
# 1. 테이블 로그인
curl -s -X POST http://localhost:8000/api/auth/table/login \
  -H "Content-Type: application/json" \
  -d '{"store_slug":"test-store","table_number":1,"password":"1234"}' | python3 -m json.tool

# 2. 메뉴 조회
curl -s http://localhost:8000/api/stores/{store_id}/menus | python3 -m json.tool

# 3. 주문 생성
curl -s -X POST http://localhost:8000/api/stores/{store_id}/tables/{table_id}/orders \
  -H "Content-Type: application/json" \
  -d '{"session_id":"{session_id}","items":[{"menu_id":"{menu_id}","quantity":2}]}' | python3 -m json.tool
# Expected: order with status=PENDING

# 4. 주문 상태 변경 (admin)
curl -s -X PATCH http://localhost:8000/api/orders/{order_id}/status \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PREPARING"}' | python3 -m json.tool

curl -s -X PATCH http://localhost:8000/api/orders/{order_id}/status \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}' | python3 -m json.tool
```

### Scenario 4: 주차 등록 → 테이블 완료 → 일마감
```bash
# 1. 주차 등록 (COMPLETED 주문 필요)
curl -s -X POST http://localhost:8000/api/stores/{store_id}/tables/{table_id}/parking \
  -H "Content-Type: application/json" \
  -d '{"session_id":"{session_id}","plate_number":"12가3456"}' | python3 -m json.tool

# 2. 테이블 이용 완료
curl -s -X POST http://localhost:8000/api/stores/{store_id}/tables/{table_id}/complete \
  -H "Authorization: $TOKEN" | python3 -m json.tool

# 3. 일마감
curl -s -X POST http://localhost:8000/api/stores/{store_id}/daily-sales/close \
  -H "Authorization: $TOKEN" | python3 -m json.tool
```

### Scenario 5: SSE 실시간 알림
```bash
# Terminal 1: SSE 스트림 연결
curl -N http://localhost:8000/api/admin/stores/{store_id}/orders/stream

# Terminal 2: 주문 생성 → Terminal 1에서 order:created 이벤트 수신 확인
```

## 검증 체크리스트
- [ ] 매장 등록 → 관리자 생성 → 로그인 성공
- [ ] 카테고리/메뉴/테이블 CRUD 정상
- [ ] 테이블 로그인 → 주문 생성 → 상태 변경 정상
- [ ] 주차 등록 (COMPLETED 주문 필수 조건 확인)
- [ ] 테이블 이용 완료 → OrderHistory 생성
- [ ] 일마감 → DailySales 생성/덮어쓰기
- [ ] SSE 이벤트 수신 확인
- [ ] Frontend http://localhost:3000 접속 및 UI 동작

## Cleanup
```bash
docker compose down -v
```

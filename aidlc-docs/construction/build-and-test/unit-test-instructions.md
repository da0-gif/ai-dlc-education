# Unit Test Execution

## TDD Status
- **Approach**: TDD (Test-Driven Development)
- **Test Plan**: `aidlc-docs/construction/plans/uow-01-test-plan.md`
- **Result**: 35/35 tests passed ✅

> TDD로 코드를 생성했으므로 unit test는 이미 실행 완료되었습니다.
> 아래는 검증용 재실행 방법입니다.

## 재실행 방법

### 로컬 실행 (Python 3.9+)
```bash
cd backend
pip3 install pytest pytest-asyncio python-jose bcrypt pydantic-settings aiofiles
python3 -m pytest tests/ -v
```

### Docker 내 실행
```bash
docker compose exec backend python -m pytest tests/ -v
```

## 예상 결과
```
tests/test_auth_service.py::test_admin_login_success PASSED
tests/test_auth_service.py::test_admin_login_store_not_found PASSED
tests/test_auth_service.py::test_admin_login_wrong_password PASSED
tests/test_auth_service.py::test_admin_login_rate_limit PASSED
tests/test_auth_service.py::test_table_login_success PASSED
tests/test_auth_service.py::test_table_login_reuse_session PASSED
tests/test_auth_service.py::test_table_login_wrong_password PASSED
... (35 tests total)
========================= 35 passed =========================
```

## Test Coverage

| Service | Test Cases | Status |
|---------|-----------|--------|
| AuthService | TC-001~TC-007 (7) | ✅ Passed |
| StoreService | TC-008~TC-009 (2) | ✅ Passed |
| AdminService | TC-010~TC-011 (2) | ✅ Passed |
| CategoryService | TC-012~TC-014 (3) | ✅ Passed |
| MenuService | TC-015~TC-017 (3) | ✅ Passed |
| OrderService | TC-018~TC-022 (5) | ✅ Passed |
| TableService | TC-023~TC-026 (4) | ✅ Passed |
| ParkingService | TC-027~TC-030 (4) | ✅ Passed |
| DailySalesService | TC-031~TC-032 (2) | ✅ Passed |
| FileStorageService | TC-033~TC-035 (3) | ✅ Passed |
| **Total** | **35** | **✅ All Passed** |

import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.services.auth_service import AuthService
from app.exceptions import NotFoundError, AuthError, RateLimitError


@pytest.fixture
def mock_repos():
    return {
        "store_repo": AsyncMock(),
        "admin_repo": AsyncMock(),
        "table_repo": AsyncMock(),
        "session_repo": AsyncMock(),
    }


@pytest.fixture
def auth_service(mock_repos):
    return AuthService(**mock_repos)


# TC-001: 유효한 자격 증명으로 관리자 로그인 성공
@pytest.mark.asyncio
async def test_admin_login_success(auth_service, mock_repos):
    from app.services.auth_service import hash_password

    store = MagicMock(id=uuid.uuid4())
    admin = MagicMock(id=uuid.uuid4(), store_id=store.id, username="admin")
    admin.password_hash = hash_password("pass123")

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["admin_repo"].find_by_store_and_username = AsyncMock(return_value=admin)

    result = await auth_service.admin_login("test-store", "admin", "pass123")
    assert "token" in result
    assert isinstance(result["token"], str)


# TC-002: 존재하지 않는 매장 slug
@pytest.mark.asyncio
async def test_admin_login_store_not_found(auth_service, mock_repos):
    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=None)

    with pytest.raises(NotFoundError):
        await auth_service.admin_login("nonexistent", "admin", "pass")


# TC-003: 잘못된 비밀번호
@pytest.mark.asyncio
async def test_admin_login_wrong_password(auth_service, mock_repos):
    from app.services.auth_service import hash_password

    store = MagicMock(id=uuid.uuid4())
    admin = MagicMock(id=uuid.uuid4(), store_id=store.id)
    admin.password_hash = hash_password("correct_password")

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["admin_repo"].find_by_store_and_username = AsyncMock(return_value=admin)

    with pytest.raises(AuthError):
        await auth_service.admin_login("test-store", "admin", "wrong")


# TC-004: 5회 실패 후 차단
@pytest.mark.asyncio
async def test_admin_login_rate_limit(auth_service, mock_repos):
    from app.services.auth_service import hash_password

    store = MagicMock(id=uuid.uuid4())
    admin = MagicMock(id=uuid.uuid4(), store_id=store.id)
    admin.password_hash = hash_password("correct_password")

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["admin_repo"].find_by_store_and_username = AsyncMock(return_value=admin)

    for _ in range(5):
        with pytest.raises(AuthError):
            await auth_service.admin_login("test-store", "admin", "wrong")

    with pytest.raises(RateLimitError):
        await auth_service.admin_login("test-store", "admin", "wrong")


# TC-005: 테이블 로그인 성공
@pytest.mark.asyncio
async def test_table_login_success(auth_service, mock_repos):
    store = MagicMock(id=uuid.uuid4())
    table = MagicMock(id=uuid.uuid4(), store_id=store.id, password="1234")
    session = MagicMock(id=uuid.uuid4())

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["table_repo"].find_by_store_and_number = AsyncMock(return_value=table)
    mock_repos["session_repo"].find_active_by_table = AsyncMock(return_value=None)
    mock_repos["session_repo"].create = AsyncMock(return_value=session)

    result = await auth_service.table_login("test-store", 1, "1234")
    assert "token" in result
    assert "session_id" in result


# TC-006: 기존 세션 재사용
@pytest.mark.asyncio
async def test_table_login_reuse_session(auth_service, mock_repos):
    store = MagicMock(id=uuid.uuid4())
    table = MagicMock(id=uuid.uuid4(), store_id=store.id, password="1234")
    existing_session = MagicMock(id=uuid.uuid4())

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["table_repo"].find_by_store_and_number = AsyncMock(return_value=table)
    mock_repos["session_repo"].find_active_by_table = AsyncMock(return_value=existing_session)

    result = await auth_service.table_login("test-store", 1, "1234")
    assert result["session_id"] == existing_session.id
    mock_repos["session_repo"].create.assert_not_called()


# TC-007: 테이블 비밀번호 불일치
@pytest.mark.asyncio
async def test_table_login_wrong_password(auth_service, mock_repos):
    store = MagicMock(id=uuid.uuid4())
    table = MagicMock(id=uuid.uuid4(), store_id=store.id, password="1234")

    mock_repos["store_repo"].find_by_slug = AsyncMock(return_value=store)
    mock_repos["table_repo"].find_by_store_and_number = AsyncMock(return_value=table)

    with pytest.raises(AuthError):
        await auth_service.table_login("test-store", 1, "wrong")

# Build Instructions

## Prerequisites
- Docker Desktop (Docker Compose v2 포함)
- 최소 4GB RAM, 10GB 디스크 여유 공간

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| DATABASE_URL | postgresql+asyncpg://postgres:postgres@db:5432/tableorder | DB 연결 |
| SECRET_KEY | change-me-in-production | JWT 서명 키 |
| POSTGRES_DB | tableorder | DB 이름 |
| POSTGRES_USER | postgres | DB 사용자 |
| POSTGRES_PASSWORD | postgres | DB 비밀번호 |

> ⚠️ 운영 환경에서는 반드시 SECRET_KEY와 DB 비밀번호를 변경하세요.

## Build Steps

### 1. Docker Compose 빌드
```bash
cd /Users/wm-it-25-00146/ai-dlc-education
docker compose build
```

### 2. 서비스 시작
```bash
docker compose up -d
```

### 3. 빌드 확인
```bash
docker compose ps
```

예상 출력:
```
NAME                SERVICE    STATUS
tableorder-db-1     db         running (healthy)
tableorder-backend-1 backend   running
tableorder-frontend-1 frontend running
```

### 4. 접속 확인
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (Swagger UI)
- DB: localhost:5432

## Troubleshooting

### Port 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8000
lsof -i :5432
```

### DB 연결 실패
```bash
# DB 로그 확인
docker compose logs db
# backend가 db보다 먼저 시작된 경우 재시작
docker compose restart backend
```

### 전체 초기화
```bash
docker compose down -v  # 볼륨 포함 삭제
docker compose up -d --build
```

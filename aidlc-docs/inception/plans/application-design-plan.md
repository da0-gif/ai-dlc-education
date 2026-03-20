# Application Design Plan

## Design Checklist
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Validate design completeness

---

## Questions

아래 질문에 답변해주세요. `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

### Question 1
Frontend 라우팅 구조는 어떻게 하시겠습니까?

A) 고객용과 관리자용을 하나의 React 앱에서 라우팅으로 분리 (예: /customer/*, /admin/*)
B) 고객용과 관리자용을 별도 React 앱으로 분리 (2개의 빌드)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
Backend API 구조는 어떻게 하시겠습니까?

A) 단일 FastAPI 앱에서 라우터로 분리 (예: /api/customer/*, /api/admin/*)
B) 고객용과 관리자용 별도 FastAPI 앱 (2개의 서버)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
데이터베이스 접근 방식은 어떻게 하시겠습니까?

A) SQLAlchemy ORM 사용
B) Raw SQL 쿼리 직접 작성
C) Tortoise ORM 사용
D) Other (please describe after [Answer]: tag below)

[Answer]: A

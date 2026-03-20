# Unit of Work - Story Map

## 매핑 요약
- **총 Unit**: 1개 (UOW-01)
- **총 Story**: 13개 (US-01 ~ US-13)
- **미할당 Story**: 0개

---

## UOW-01: 테이블오더 풀스택 애플리케이션

### 고객 여정 Stories
| Story | 제목 | 관련 모듈 |
|-------|------|----------|
| US-01 | 테이블 태블릿 자동 접속 | Auth (FC-01, BC-01) |
| US-02 | 메뉴 탐색 | Customer (FC-02, BC-02) |
| US-03 | 장바구니 관리 | Customer (FC-03) |
| US-04 | 주문 생성 | Customer (FC-04, BC-03, BC-06) |
| US-05 | 주문 내역 조회 | Customer (FC-04, BC-03) |
| US-13 | 무료 주차 차량 등록 | Customer (FC-09, BC-07) |

### 관리자 여정 Stories
| Story | 제목 | 관련 모듈 |
|-------|------|----------|
| US-06 | 관리자 로그인 | Auth (FC-01, BC-01) |
| US-07 | 매장 등록 및 관리 | Admin (FC-08, BC-05) |
| US-08 | 실시간 주문 모니터링 | Admin (FC-05, BC-06) |
| US-09 | 주문 상태 변경 | Admin (FC-05, BC-03, BC-06) |
| US-10 | 테이블 관리 | Admin (FC-07, BC-04, BC-03) |
| US-11 | 과거 주문 내역 조회 | Admin (FC-07, BC-04) |
| US-12 | 메뉴 관리 | Admin (FC-06, BC-02) |

---

## 검증
- ✅ 13개 Story 모두 UOW-01에 할당됨
- ✅ 미할당 Story 없음
- ✅ 모든 Frontend/Backend 컴포넌트가 최소 1개 Story에 매핑됨

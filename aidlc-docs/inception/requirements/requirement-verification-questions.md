# 요구사항 검증 질문

요구사항 문서를 분석한 결과, 아래 항목들에 대한 확인이 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

## Question 1
기술 스택(Tech Stack)은 무엇을 사용하시겠습니까?

A) Frontend: React + Backend: Node.js (Express) + DB: SQLite
B) Frontend: React + Backend: Node.js (Express) + DB: PostgreSQL
C) Frontend: Vue.js + Backend: Node.js (Express) + DB: SQLite
D) Frontend: React + Backend: Python (FastAPI) + DB: PostgreSQL
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
메뉴 이미지는 어떻게 처리하시겠습니까?

A) 외부 이미지 URL만 저장 (이미지 업로드 없음)
B) 서버에 이미지 파일 업로드 및 저장
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
관리자 계정은 어떻게 관리하시겠습니까?

A) 매장당 1개의 관리자 계정 (사전 등록, 회원가입 없음)
B) 매장당 다수의 관리자 계정 (회원가입 기능 포함)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
매장(Store) 데이터는 어떻게 생성하시겠습니까?

A) DB에 직접 seed 데이터로 사전 등록 (매장 생성 UI 없음)
B) 관리자 화면에서 매장 등록 기능 제공
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
테이블 수는 매장당 어느 정도를 기본으로 가정하시겠습니까?

A) 소규모 (1~10개)
B) 중규모 (10~30개)
C) 대규모 (30개 이상)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 6
주문 상태 변경 흐름은 어떻게 하시겠습니까?

A) 대기중 → 준비중 → 완료 (3단계, 관리자가 수동 변경)
B) 대기중 → 완료 (2단계, 간소화)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
배포 환경은 어떻게 계획하시겠습니까?

A) 로컬 개발 환경만 (localhost)
B) AWS 클라우드 배포 (EC2, RDS 등)
C) Docker 컨테이너 기반
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
다중 매장 지원이 필요하십니까? (하나의 서버에서 여러 매장 운영)

A) 단일 매장만 지원 (MVP)
B) 다중 매장 지원 (매장별 데이터 분리)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

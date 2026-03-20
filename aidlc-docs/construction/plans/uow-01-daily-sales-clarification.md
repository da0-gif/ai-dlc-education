# Functional Design - 일마감 후 추가 주문 처리 Clarification

## 배경
일마감(일별 매출 집계) 이후에도 추가 주문이 발생할 수 있습니다.
이 경우의 처리 방식을 결정해야 합니다.

## Question 1
일마감 이후 추가 주문이 발생하면 어떻게 처리합니까?

A) 일마감 재실행 허용 - 같은 날짜에 다시 "일마감" 버튼을 누르면 추가 주문 포함하여 덮어쓰기
B) 일마감 이후 추가 주문은 다음 날 매출로 자동 귀속
C) 일마감 이후에는 주문 접수를 차단 (영업 종료 상태)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

WMS Inventory Management System
Spring Boot & React를 활용한 엔드 투 엔드 재고 관리 프로젝트

🛠 Tech Stacks
Infrastructure & Database

PostgreSQL: 관계형 데이터베이스 설계 및 관리.

DBeaver: DB 관리 및 SQL 쿼리 최적화 테스트.

Backend (API Server)

Java 21 / Spring Boot 3.2: RESTful API 서버 구축.

Spring Data JPA: 객체 지향적 데이터 핸들링 및 낙관적 락(Optimistic Lock) 구현.

Apache POI: 서버 사이드 엑셀 리포트 생성 및 다운로드 구현.

Frontend (UI/UX)

React (Vite): 컴포넌트 기반 UI 구현.

Recharts: 재고 현황 시각화를 위한 차트 라이브러리 적용.

File Handling: Blob 객체를 이용한 엑셀 파일 다운로드 로직 구현.

Key Features & Implementation
Optimistic Locking: @Version을 이용해 동시성 문제를 제어하고 데이터 무결성 보장.

Inventory History: 재고 수량 변경 시 입/출고 이력을 자동으로 기록하고 조회하는 기능.

Excel Export: 전체 재고 현황을 .xlsx 형식으로 추출하는 기능 구현.

Real-time Stats: Recharts를 활용해 재고 상태(안정/부족/품절)를 시각적으로 대시보드에 구현.

CORS Configuration: 서로 다른 포트 간의 통신 보안 이슈 해결.

📝 Troubleshooting & Insight
Concurrency Control: 낙관적 락 적용 시 기존 데이터의 Version 필드가 NULL일 경우 발생하는 에러를 DB 마이그레이션 쿼리를 통해 해결함.

File Stream Handling: 서버에서 생성한 바이너리 데이터를 프론트엔드에서 파일 형태로 변환하여 사용자에게 전달하는 흐름 파악.

Refactoring: 테이블 명칭 불일치 및 필드 타입 에러를 디버깅하며 백엔드와 DB 간의 매핑 구조를 명확히 이해함.

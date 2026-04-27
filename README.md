📦 WMS Inventory Management System
Spring Boot & React를 활용한 엔드 투 엔드 재고 관리 프로젝트

단순한 데이터 조회를 넘어, 데이터베이스 설계부터 백엔드 API 구축, 프론트엔드 연동까지 전 과정을 직접 구현한 프로젝트입니다.

### 🛠 Tech Stacks
### Infrastructure & Database
PostgreSQL: 관계형 데이터베이스 설계 및 관리.

DBeaver: DB 관리 및 SQL 쿼리 최적화 테스트.

### Backend (API Server)
Java 21 / Spring Boot 3.2: RESTful API 서버 구축.

Spring Data JPA: 객체 지향적 데이터 핸들링 및 DB 연동.

### Frontend (UI/UX)
React (Vite): 컴포넌트 기반 UI 구현.

State Management: useState, useEffect를 이용한 실시간 데이터 렌더링.

### Key Features & Implementation
REST API Architecture: Spring Boot를 이용해 데이터 조회(GET) 및 등록(POST) API를 설계하고 React와 연결.

CORS Configuration: 서로 다른 포트(8080-5173) 간의 통신 보안 이슈 해결.

Full-Stack Connectivity: DB 데이터가 서버를 거쳐 프론트엔드 표(Table)에 뿌려지기까지의 전체 흐름(Data Flow) 제어.

Data Integrity: DB SERIAL 타입을 이용한 ID 자동 생성 및 트랜잭션 관리.

### 📝 Troubleshooting & Insight
Environment Setup: 초기 로컬 환경에서 DB 연결 설정 및 리스트 비활성화 이슈를 해결하며 툴의 구성 원리를 파악함.

State Flow: 프론트엔드에서 fetch API를 통해 백엔드 데이터를 비동기로 처리하고, UI를 즉각 업데이트하는 로직 구현.

Future Plan: 향후 재고 삭제, 수정(Update/Delete) 기능 추가 및 UI 라이브러리를 적용한 디자인 고도화 예정.

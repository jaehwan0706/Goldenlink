# 🔗 Goldenlink (골든링크)

**Goldenlink**는 공공데이터 API를 활용한 실시간 병원 검색 서비스와 사용자 커뮤니티를 결합한 **Spring Boot 기반 REST API 서버** 프로젝트입니다.

---

## 🚀 주요 기능 (Key Features)

### 🏥 병원 정보 및 외부 API 연동
* **실시간 데이터 조회**: 공공데이터포털의 병원 정보 API를 호출하여 최신 정보를 제공합니다.
* **위치 기반 검색**: 사용자의 위도와 경도 데이터를 기반으로 주변 병원 목록을 반환합니다.
* **상세 검색 기능**: 병원 이름 및 주소를 활용한 필터링 검색이 가능합니다.

### 🔐 인증 및 사용자 관리 (User)
* **회원가입 및 로그인**: `EntityUser`를 통해 사용자 정보를 저장하고 인증 로직을 수행합니다.
* **권한 부여**: 일반 사용자와 관리자 권한을 구분하여 보안을 강화했습니다.

### 📋 커뮤니티 서비스 (Board)
* **게시판 CRUD**: 병원 후기 및 정보 공유를 위한 게시글 작성, 조회, 수정, 삭제 기능을 제공합니다.
* **댓글 시스템**: 게시글에 대한 실시간 피드백 및 소통이 가능합니다.
* **접근 제어**: 본인이 작성한 게시물만 수정 및 삭제할 수 있는 로직이 적용되어 있습니다.

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 |
| :--- | :--- |
| **Framework** | Spring Boot 3.x |
| **Language** | Java 21 |
| **Database** | MySQL |
| **ORM** | Spring Data JPA |
| **API 연동** | Kakao REST API, 공공데이터 API |
| **Tools** | IntelliJ IDEA, Postman, Git |

---

## 📂 프로젝트 구조 (Project Structure)

```text
backend.goldenlink
├── config          # Security 및 시스템 설정
├── controller      # API 엔드포인트 제어 (User, Hospital, Board)
├── service         # 비즈니스 로직 처리
├── repository      # 데이터베이스 접근 인터페이스
├── entity          # DB 테이블 매핑 객체
└── dto             # 데이터 전송용 객체 (HospitalDto, UserLoginDTO 등)

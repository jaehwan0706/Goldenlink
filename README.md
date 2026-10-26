# 🔗 Goldenlink (골든링크) — 병원 검색 + 커뮤니티 REST API 서버

> 공공데이터 API로 주변 병원을 찾고, 병원 후기와 정보를 나누는 커뮤니티를 결합한 Spring Boot 기반 서비스입니다.

- **팀 저장소**: https://github.com/ur0729-crypto/goldenlink
- **내 역할**: **DB 설계 총괄**

<br>

## 📌 주요 기능

- **병원 검색**: 공공데이터 병원 정보 API를 호출해 사용자 위치(위도·경도) 기준 주변 병원 목록 제공, 이름·주소로 필터링
- **회원**: 회원가입·로그인, 일반 사용자 / 관리자 권한 구분
- **커뮤니티**: 게시글 CRUD, 댓글, 본인이 쓴 글만 수정·삭제
- **즐겨찾기**: 관심 병원 저장

<br>

## 🗂 DB 설계 (내 담당)

| 엔티티 | 설명 |
| --- | --- |
| `EntityUser` | 회원 정보, 권한(일반 / 관리자) |
| `Board` | 게시글 (작성자와 연결) |
| `Comment` | 게시글 댓글 (게시글 · 작성자와 연결) |
| `Bookmark` | 사용자가 저장한 병원 (병원 ID · 이름 · 주소 · 전화 · 위도/경도 · 거리) |

<br>

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| Backend | Java 21, Spring Boot 3, Spring Data JPA |
| Database | MySQL |
| 외부 API | 공공데이터 병원 정보 API, Kakao REST API |
| Tools | IntelliJ IDEA, Postman, Git |

<br>

## 📂 프로젝트 구조

```
backend.goldenlink
├── config        # Security 및 시스템 설정
├── controller    # User · Hospital · Board API
├── service       # 비즈니스 로직
├── repository    # DB 접근
├── entity        # DB 테이블 매핑
└── dto           # 요청 · 응답 객체
```

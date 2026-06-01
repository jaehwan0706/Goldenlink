-- =============================================================
-- 5MIN 실시간 응급 케어 플랫폼 - MySQL 스키마
-- Version: 1.0.0  |  PRD v2.1 기준
-- =============================================================

CREATE DATABASE IF NOT EXISTS fivemin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fivemin;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- 1. 사용자 인증 / 권한
-- =============================================================

CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,         -- bcrypt (cost=12)
    role          ENUM('user','admin','hospital_staff') NOT NULL DEFAULT 'user',
    is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME     NULL                              -- soft delete
);

CREATE TABLE refresh_tokens (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL,        -- SHA-256(raw token)
    device_info VARCHAR(500),
    expires_at  DATETIME        NOT NULL,
    is_revoked  TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_expires (user_id, expires_at)
);

-- =============================================================
-- 2. 환자 프로필
-- =============================================================

CREATE TABLE patient_profiles (
    id                       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                  BIGINT UNSIGNED NOT NULL,
    name                     VARCHAR(100)    NOT NULL,
    birth_date               DATE,
    blood_type               ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-','UNKNOWN') DEFAULT 'UNKNOWN',
    emergency_vehicle_number VARCHAR(20),            -- 응급 차량 번호
    is_primary               TINYINT(1)      NOT NULL DEFAULT 1,
    created_at               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE emergency_contacts (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id   BIGINT UNSIGNED NOT NULL,
    name         VARCHAR(100)    NOT NULL,
    phone        VARCHAR(20)     NOT NULL,
    relationship VARCHAR(50),                    -- 배우자, 부모, 자녀 등
    is_primary   TINYINT(1)      NOT NULL DEFAULT 0,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id)
);

-- 지병 (PRD 체크박스 기반)
CREATE TABLE patient_conditions (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id     BIGINT UNSIGNED NOT NULL,
    condition_type ENUM(
        'diabetes',       -- 당뇨
        'hypertension',   -- 혈압
        'heart_disease',  -- 심질환
        'stroke',         -- 뇌졸중
        'kidney_disease', -- 신장질환
        'liver_disease',  -- 간질환
        'respiratory',    -- 호흡기
        'cancer',         -- 암
        'allergy',        -- 알레르기
        'other'
    ) NOT NULL,
    detail         VARCHAR(200),                 -- 기타 상세 기입
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY uq_patient_condition (patient_id, condition_type)
);

-- 복용약 (PRD: 아스피린·와파린 등 약칭 직접 입력)
CREATE TABLE patient_medications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT UNSIGNED NOT NULL,
    medication_name VARCHAR(100)    NOT NULL,
    dosage          VARCHAR(100),
    notes           VARCHAR(500),
    is_critical     TINYINT(1)      NOT NULL DEFAULT 0,  -- 혈전용해제 등 응급 시 필수 고지
    sort_order      TINYINT         NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id)
);

-- =============================================================
-- 3. Medical ID 암호화 저장 & QR 파싱
-- =============================================================

-- 암호화된 의료 데이터 (AES-256-GCM, 키는 앱 서버 환경변수)
CREATE TABLE medical_id_tokens (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id          BIGINT UNSIGNED NOT NULL UNIQUE,
    encrypted_payload   LONGTEXT        NOT NULL,   -- Base64(AES-256-GCM 암호화 JSON)
    encryption_iv       VARCHAR(64)     NOT NULL,   -- Base64(12-byte GCM nonce)
    encryption_tag      VARCHAR(64)     NOT NULL,   -- Base64(16-byte GCM auth tag)
    payload_hash        CHAR(64)        NOT NULL,   -- SHA-256 무결성 체크섬
    qr_token            VARCHAR(255)    UNIQUE NOT NULL,  -- 단기 공개 스캔 토큰
    qr_token_expires_at DATETIME        NOT NULL,         -- 기본 30분, 재발급 가능
    last_generated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
    INDEX idx_qr_token   (qr_token),
    INDEX idx_qr_expires (qr_token_expires_at)
);

-- QR 스캔 감사 로그 (보안·이력 추적)
CREATE TABLE qr_scan_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qr_token    VARCHAR(255)    NOT NULL,
    patient_id  BIGINT UNSIGNED,
    scanned_by  VARCHAR(100),           -- '응급실_접수', '119_구급대원' 등
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    is_valid    TINYINT(1)      NOT NULL DEFAULT 1,  -- 만료·위조 여부
    scanned_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_qr_token   (qr_token),
    INDEX idx_scanned_at (scanned_at)
);

-- =============================================================
-- 4. 병원 / 병상 / 제한 조건
-- =============================================================

CREATE TABLE hospitals (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hpid            VARCHAR(20)     UNIQUE NOT NULL,   -- 보건복지부 오픈 API 기관 코드
    name            VARCHAR(200)    NOT NULL,
    address         VARCHAR(500),
    latitude        DECIMAL(10,7)   NOT NULL,
    longitude       DECIMAL(10,7)   NOT NULL,
    phone           VARCHAR(30),
    emergency_phone VARCHAR(30),
    type            ENUM('general','children','trauma','public') NOT NULL DEFAULT 'general',
    has_pediatric   TINYINT(1)      NOT NULL DEFAULT 0,
    has_ct          TINYINT(1)      NOT NULL DEFAULT 0,
    has_mri         TINYINT(1)      NOT NULL DEFAULT 0,
    is_moonlight    TINYINT(1)      NOT NULL DEFAULT 0,  -- 달빛어린이병원
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 위치 기반 조회 최적화
    INDEX idx_location  (latitude, longitude),
    INDEX idx_hpid      (hpid),
    INDEX idx_type      (type, is_active)
);

-- 실시간 병상 (오픈 API 폴링, 2분 주기 갱신)
CREATE TABLE hospital_beds (
    id                       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hospital_id              BIGINT UNSIGNED NOT NULL UNIQUE,
    adult_total              SMALLINT        NOT NULL DEFAULT 0,
    adult_available          SMALLINT        NOT NULL DEFAULT 0,
    pediatric_total          SMALLINT        NOT NULL DEFAULT 0,
    pediatric_available      SMALLINT        NOT NULL DEFAULT 0,
    isolation_total          SMALLINT        NOT NULL DEFAULT 0,  -- 음압 격리실
    isolation_available      SMALLINT        NOT NULL DEFAULT 0,
    trauma_total             SMALLINT        NOT NULL DEFAULT 0,
    trauma_available         SMALLINT        NOT NULL DEFAULT 0,
    pediatric_specialist_on  TINYINT(1)      NOT NULL DEFAULT 0,  -- 소아청소년과 전문의 상주
    avg_wait_minutes         SMALLINT        NOT NULL DEFAULT 0,
    last_synced_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_last_synced (last_synced_at)
);

-- 실시간 제한 조건 (백오피스 입력, PRD 4.1 Critical Policy)
CREATE TABLE hospital_restrictions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT UNSIGNED NOT NULL,
    severity    ENUM('warning','critical') NOT NULL DEFAULT 'warning',  -- yellow / red 배너
    category    ENUM('equipment','staff','capacity','other')  NOT NULL,
    message     VARCHAR(500)    NOT NULL,   -- e.g. '현재 CT 장비 점검으로 인해 뇌질환 환자 수용 불가'
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    starts_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  DATETIME        NULL,       -- NULL = 수동 해제 전까지 유효
    created_by  BIGINT UNSIGNED,            -- 백오피스 admin user_id
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_hospital_active (hospital_id, is_active),
    INDEX idx_expires_at      (expires_at)
);

-- =============================================================
-- 5. 즐겨찾기
-- =============================================================

CREATE TABLE favorites (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY  uq_user_hospital (user_id, hospital_id),
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- =============================================================
-- 6. 오프라인 캐시 (PRD 5 - 네트워크 데드존 대응)
-- =============================================================

CREATE TABLE offline_cache (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cache_key   VARCHAR(255)    UNIQUE NOT NULL,
    cache_type  ENUM(
        'hospital_list',
        'hospital_detail',
        'bed_status',
        'golden_time_guide'   -- 골든타임 처치 가이드는 로컬 상시 구동
    ) NOT NULL,
    payload     LONGTEXT        NOT NULL,   -- JSON
    region_code VARCHAR(10),               -- 시도 코드 (광역 뷰 fallback용)
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  DATETIME        NOT NULL,
    INDEX idx_type       (cache_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_region     (region_code)
);

SET FOREIGN_KEY_CHECKS = 1;

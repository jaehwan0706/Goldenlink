USE fivemin;

-- PASS 본인인증 세션 관리
CREATE TABLE phone_verifications (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED,                  -- NULL = 회원가입 전 인증
    request_no    VARCHAR(30) UNIQUE NOT NULL,       -- NICE 요청 번호
    status        ENUM('pending','success','fail','expired') NOT NULL DEFAULT 'pending',

    -- NICE 인증 완료 후 채워지는 필드
    ci            VARCHAR(100),   -- 연계정보 (CI, 유저 고유 식별자)
    di            VARCHAR(100),   -- 중복가입확인정보
    verified_name VARCHAR(50),
    verified_phone VARCHAR(20),
    birth_date    DATE,
    gender        ENUM('M','F'),
    carrier       ENUM('SKT','KT','LGU+','SKT_MVNO','KT_MVNO','LGU+_MVNO'),

    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    DATETIME NOT NULL,                -- 기본 5분
    verified_at   DATETIME,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request_no (request_no),
    INDEX idx_status     (status),
    INDEX idx_expires    (expires_at)
);

-- users 테이블에 본인인증 CI 추가
ALTER TABLE users
    ADD COLUMN ci         VARCHAR(100) UNIQUE AFTER phone,
    ADD COLUMN is_verified_phone TINYINT(1) NOT NULL DEFAULT 0 AFTER ci;

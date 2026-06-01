-- =============================================================
-- 5MIN - 저장 프로시저 & 뷰
-- =============================================================

USE fivemin;

DELIMITER $$

-- -------------------------------------------------------------
-- 만료된 QR 토큰 정리 (스케줄러 호출용 - 매 10분)
-- -------------------------------------------------------------
CREATE PROCEDURE cleanup_expired_qr_tokens()
BEGIN
    UPDATE medical_id_tokens
    SET    qr_token            = NULL,
           qr_token_expires_at = NULL
    WHERE  qr_token_expires_at < NOW();
END$$

-- -------------------------------------------------------------
-- 만료된 refresh_token 정리 (스케줄러 호출용 - 매 1시간)
-- -------------------------------------------------------------
CREATE PROCEDURE cleanup_expired_refresh_tokens()
BEGIN
    DELETE FROM refresh_tokens
    WHERE  expires_at < NOW()
       OR  is_revoked = 1;
END$$

-- -------------------------------------------------------------
-- 만료된 hospital_restrictions 자동 비활성화
-- -------------------------------------------------------------
CREATE PROCEDURE deactivate_expired_restrictions()
BEGIN
    UPDATE hospital_restrictions
    SET    is_active = 0
    WHERE  is_active = 1
      AND  expires_at IS NOT NULL
      AND  expires_at < NOW();
END$$

-- -------------------------------------------------------------
-- 만료된 오프라인 캐시 정리
-- -------------------------------------------------------------
CREATE PROCEDURE cleanup_offline_cache()
BEGIN
    DELETE FROM offline_cache
    WHERE  expires_at < NOW();
END$$

-- -------------------------------------------------------------
-- 신호등 상태 계산 함수 (PRD 4.1: 여유≥5 / 주의≤2 / 혼잡=0)
-- 반환값: 'green' | 'yellow' | 'red'
-- -------------------------------------------------------------
CREATE FUNCTION get_bed_status(available SMALLINT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    IF    available >= 5 THEN RETURN 'green';
    ELSEIF available >= 1 THEN RETURN 'yellow';
    ELSE                       RETURN 'red';
    END IF;
END$$

DELIMITER ;

-- =============================================================
-- 뷰: 병원 실시간 현황 통합 (API 레이어에서 직접 조회)
-- =============================================================

CREATE OR REPLACE VIEW v_hospital_realtime AS
SELECT
    h.id,
    h.hpid,
    h.name,
    h.address,
    h.latitude,
    h.longitude,
    h.phone,
    h.emergency_phone,
    h.type,
    h.has_pediatric,
    h.has_ct,
    h.has_mri,
    h.is_moonlight,

    -- 병상 현황
    b.adult_available,
    b.pediatric_available,
    b.isolation_available,
    b.avg_wait_minutes,
    b.pediatric_specialist_on,
    b.last_synced_at,

    -- 신호등 상태
    get_bed_status(b.adult_available)     AS adult_status,
    get_bed_status(b.pediatric_available) AS pediatric_status,
    get_bed_status(b.isolation_available) AS isolation_status,

    -- 활성 제한 조건 건수 (배너 표시 여부 판단용)
    (
        SELECT COUNT(*)
        FROM   hospital_restrictions r
        WHERE  r.hospital_id = h.id
          AND  r.is_active   = 1
    ) AS active_restriction_count

FROM hospitals h
LEFT JOIN hospital_beds b ON b.hospital_id = h.id
WHERE h.is_active = 1;

-- =============================================================
-- 뷰: 소아/야간 특화 탭용 (PRD 4.2)
-- =============================================================

CREATE OR REPLACE VIEW v_hospital_pediatric AS
SELECT *
FROM   v_hospital_realtime
WHERE  has_pediatric = 1
   OR  is_moonlight  = 1;

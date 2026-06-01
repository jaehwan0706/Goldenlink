/**
 * 오프라인 캐시 서비스 (PRD 5 - 네트워크 데드존 대응)
 *
 * 캐시 정책:
 *   - hospital_list / bed_status : TTL 2분 (실시간성 우선)
 *   - hospital_detail            : TTL 10분
 *   - golden_time_guide          : TTL 7일 (오프라인 상시 구동 보장)
 *
 * 오프라인 시 흐름:
 *   1. API 호출 실패 감지
 *   2. 캐시 히트 → 만료 여부 무관하게 stale 데이터 반환 + 경고 플래그
 *   3. golden_time_guide는 항상 캐시에서 서빙 (Force Routing 대상)
 */

const db = require('../config/database');

const TTL = {
  hospital_list:      2  * 60,       // 초
  hospital_detail:    10 * 60,
  bed_status:         2  * 60,
  golden_time_guide:  7  * 24 * 3600,
};

// -------------------------------------------------------------
// 캐시 저장 / 갱신
// -------------------------------------------------------------
async function setCache(cacheType, key, payload, regionCode = null) {
  const ttlSeconds = TTL[cacheType] ?? 300;
  const expiresAt  = new Date(Date.now() + ttlSeconds * 1000);

  await db.query(
    `INSERT INTO offline_cache (cache_key, cache_type, payload, region_code, expires_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       payload     = VALUES(payload),
       region_code = VALUES(region_code),
       created_at  = NOW(),
       expires_at  = VALUES(expires_at)`,
    [key, cacheType, JSON.stringify(payload), regionCode, expiresAt],
  );
}

// -------------------------------------------------------------
// 캐시 조회
// -------------------------------------------------------------
async function getCache(key) {
  const [[row]] = await db.query(
    `SELECT payload, cache_type, expires_at FROM offline_cache WHERE cache_key = ?`,
    [key],
  );
  if (!row) return null;

  return {
    data:      JSON.parse(row.payload),
    cacheType: row.cache_type,
    isStale:   new Date(row.expires_at) < new Date(),
    expiresAt: row.expires_at,
  };
}

// -------------------------------------------------------------
// 오프라인 Fallback: 최신 골든타임 가이드 반환
// golden_time_guide는 만료 여부와 무관하게 항상 반환
// -------------------------------------------------------------
async function getGoldenTimeGuideForOffline() {
  const [[row]] = await db.query(
    `SELECT payload FROM offline_cache
     WHERE  cache_type = 'golden_time_guide'
     ORDER BY created_at DESC LIMIT 1`,
  );
  return row ? JSON.parse(row.payload) : null;
}

// -------------------------------------------------------------
// 광역 뷰 fallback: 반경 10km 내 병원 없을 때 (PRD 5 - 음영 지역)
// -------------------------------------------------------------
async function getRegionFallbackCache(regionCode) {
  const [[row]] = await db.query(
    `SELECT payload, expires_at FROM offline_cache
     WHERE  cache_type   = 'hospital_list'
       AND  region_code  = ?
     ORDER BY created_at DESC LIMIT 1`,
    [regionCode],
  );
  if (!row) return null;
  return {
    data:    JSON.parse(row.payload),
    isStale: new Date(row.expires_at) < new Date(),
  };
}

// -------------------------------------------------------------
// 만료 캐시 정리 (DB 스케줄러 보완용)
// -------------------------------------------------------------
async function purgeExpiredCache() {
  const [result] = await db.query(
    `DELETE FROM offline_cache
     WHERE  cache_type != 'golden_time_guide'
       AND  expires_at  < NOW()`,
  );
  return result.affectedRows;
}

module.exports = {
  setCache,
  getCache,
  getGoldenTimeGuideForOffline,
  getRegionFallbackCache,
  purgeExpiredCache,
};

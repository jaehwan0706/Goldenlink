/**
 * 포트원(PortOne) PASS 본인인증 서비스
 *
 * 사전 준비 (무료, 사업자 불필요):
 *  1. https://portone.io 회원가입
 *  2. 콘솔 → 내 식별코드 확인 (imp_xxxxxxxx)
 *  3. 콘솔 → API Keys → imp_key / imp_secret 발급
 *  4. 본인인증 → NICE / KCB 테스트 채널 활성화
 *
 * 인증 흐름:
 *  1. 앱(프론트)에서 포트원 SDK로 IMP.certification() 호출
 *  2. 사용자가 PASS 앱 승인
 *  3. 포트원이 imp_uid 를 앱에 반환
 *  4. 앱이 POST /pass/verify 로 imp_uid 전송
 *  5. 서버가 포트원 API로 imp_uid 검증 → CI/이름/전화 저장
 */

const https = require('https');
const db    = require('../config/database');

const PORTONE_BASE = 'api.iamport.kr';

// ── 포트원 API 공통 요청 ──────────────────────────────────────
function portoneRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: PORTONE_BASE,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end',  () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('포트원 응답 파싱 실패')); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── 포트원 액세스 토큰 발급 ───────────────────────────────────
async function getAccessToken() {
  const res = await portoneRequest('POST', '/users/getToken', {
    imp_key:    process.env.PORTONE_IMP_KEY,
    imp_secret: process.env.PORTONE_IMP_SECRET,
  });

  if (res.code !== 0) {
    throw Object.assign(
      new Error(`포트원 토큰 발급 실패: ${res.message}`),
      { status: 502 },
    );
  }
  return res.response.access_token;
}

// ── imp_uid 로 인증 결과 조회 ─────────────────────────────────
async function getCertification(impUid, accessToken) {
  const res = await portoneRequest(
    'GET',
    `/certifications/${encodeURIComponent(impUid)}`,
    null,
    accessToken,
  );

  if (res.code !== 0) {
    throw Object.assign(
      new Error(`포트원 인증 조회 실패: ${res.message}`),
      { status: 502 },
    );
  }
  return res.response;
}

// ── 핵심: imp_uid 검증 & DB 저장 ─────────────────────────────
async function verify({ impUid, userId }) {
  // 1. 포트원에서 인증 정보 조회
  const token = await getAccessToken();
  const cert  = await getCertification(impUid, token);

  if (!cert.certified) {
    throw Object.assign(new Error('인증이 완료되지 않았습니다.'), { status: 400 });
  }

  // 2. CI 중복 가입 체크
  const [[dup]] = await db.query(
    'SELECT id FROM users WHERE ci = ? AND id != ?',
    [cert.unique_key, userId],
  );
  if (dup) {
    throw Object.assign(new Error('이미 가입된 본인인증 정보입니다.'), { status: 409 });
  }

  // 3. DB 저장
  const birthDate = cert.birthday   // "YYYY-MM-DD" 형식
    ?? (cert.birth ? `${cert.birth.substring(0,4)}-${cert.birth.substring(4,6)}-${cert.birth.substring(6,8)}` : null);

  await db.query(
    `INSERT INTO phone_verifications
       (user_id, request_no, status, ci, di, verified_name, verified_phone, birth_date, gender, verified_at, expires_at)
     VALUES (?, ?, 'success', ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [
      userId,
      impUid,
      cert.unique_key,        // CI
      cert.unique_in_site,    // DI
      cert.name,
      cert.phone,
      birthDate,
      cert.gender === 'male' ? 'M' : 'F',
    ],
  );

  // 4. users 테이블에 CI·전화번호 업데이트
  await db.query(
    `UPDATE users SET ci = ?, phone = ?, is_verified_phone = 1 WHERE id = ?`,
    [cert.unique_key, cert.phone, userId],
  );

  return {
    name:      cert.name,
    phone:     cert.phone,
    birthDate,
    gender:    cert.gender,
  };
}

module.exports = { verify };

const https = require('https');
const db    = require('../config/database');

// 포트원 API 토큰 발급
async function getToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      imp_key:    process.env.PORTONE_IMP_KEY,
      imp_secret: process.env.PORTONE_IMP_SECRET,
    });

    const req = https.request({
      hostname: 'api.iamport.kr',
      path:     '/users/getToken',
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.code !== 0) return reject(new Error(json.message));
        resolve(json.response.access_token);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// imp_uid 로 인증 결과 조회
async function getCertification(impUid, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.iamport.kr',
      path:     `/certifications/${impUid}`,
      method:   'GET',
      headers:  { Authorization: token },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.code !== 0) return reject(new Error(json.message));
        resolve(json.response);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 메인: imp_uid 검증 후 DB 저장
async function verifyPass(impUid, userId) {
  const token = await getToken();
  const cert  = await getCertification(impUid, token);

  if (!cert.certified) {
    const err = new Error('인증이 완료되지 않았습니다.');
    err.status = 400;
    throw err;
  }

  // 중복 가입 체크 (같은 CI로 이미 가입된 계정 있는지)
  const [[dup]] = await db.query(
    'SELECT id FROM users WHERE ci = ? AND id != ?',
    [cert.unique_key, userId],
  );
  if (dup) {
    const err = new Error('이미 본인인증된 다른 계정이 존재합니다.');
    err.status = 409;
    throw err;
  }

  // users 테이블에 CI·전화번호 저장
  await db.query(
    `UPDATE users
     SET ci = ?, phone = ?, is_verified_phone = 1
     WHERE id = ?`,
    [cert.unique_key, cert.phone, userId],
  );

  return {
    name:  cert.name,
    phone: cert.phone,
    birth: cert.birthday,
  };
}

module.exports = { verifyPass };

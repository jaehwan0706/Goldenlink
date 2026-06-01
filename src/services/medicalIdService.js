/**
 * Medical ID 암호화 저장 & QR 코드 파싱 서비스
 *
 * 암호화 전략:
 *   - 알고리즘: AES-256-GCM (인증된 암호화, 위변조 탐지 포함)
 *   - 키: 환경변수 MEDICAL_ID_ENCRYPTION_KEY (32-byte hex, 64자)
 *   - Nonce: 스캔 때마다 새로 생성 (12 byte)
 *   - 평문은 외부 서버에 절대 저장하지 않음 (PRD 4.5 보안 정책)
 *
 * QR 토큰 전략:
 *   - 형식: crypto.randomUUID()  (충돌 불가 단기 토큰)
 *   - 유효기간: 30분 (사용자가 재생성 가능)
 *   - 스캔 시 DB에서 복호화 후 JSON 반환
 */

const crypto = require('crypto');
const db     = require('../config/database');

const ALGORITHM    = 'aes-256-gcm';
const IV_LENGTH    = 12;   // GCM 권장 nonce 길이
const QR_TTL_MIN   = 30;   // QR 유효 시간(분)

function getEncryptionKey() {
  const hex = process.env.MEDICAL_ID_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('MEDICAL_ID_ENCRYPTION_KEY 환경변수가 설정되지 않았거나 올바르지 않습니다.');
  }
  return Buffer.from(hex, 'hex');
}

// -------------------------------------------------------------
// 암호화
// -------------------------------------------------------------
function encrypt(plaintext) {
  const key  = getEncryptionKey();
  const iv   = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encryptedPayload: encrypted.toString('base64'),
    iv:               iv.toString('base64'),
    tag:              tag.toString('base64'),
  };
}

// -------------------------------------------------------------
// 복호화
// -------------------------------------------------------------
function decrypt(encryptedPayload, ivBase64, tagBase64) {
  const key      = getEncryptionKey();
  const iv       = Buffer.from(ivBase64,         'base64');
  const tag      = Buffer.from(tagBase64,         'base64');
  const data     = Buffer.from(encryptedPayload, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

// -------------------------------------------------------------
// Medical ID JSON 빌드 (DB → 평문 객체)
// -------------------------------------------------------------
async function buildMedicalPayload(patientId) {
  const conn = await db.getConnection();
  try {
    const [[profile]] = await conn.query(
      `SELECT p.name, p.birth_date, p.blood_type, p.emergency_vehicle_number,
              u.phone AS guardian_phone
       FROM   patient_profiles p
       JOIN   users u ON u.id = p.user_id
       WHERE  p.id = ?`,
      [patientId],
    );
    if (!profile) throw new Error(`환자 프로필 없음: patientId=${patientId}`);

    const [contacts] = await conn.query(
      `SELECT name, phone, relationship FROM emergency_contacts
       WHERE  patient_id = ? ORDER BY is_primary DESC`,
      [patientId],
    );

    const [conditions] = await conn.query(
      `SELECT condition_type, detail FROM patient_conditions WHERE patient_id = ?`,
      [patientId],
    );

    const [medications] = await conn.query(
      `SELECT medication_name, dosage, is_critical FROM patient_medications
       WHERE  patient_id = ? ORDER BY is_critical DESC, sort_order`,
      [patientId],
    );

    return {
      name:                  profile.name,
      birthDate:             profile.birth_date,
      bloodType:             profile.blood_type,
      emergencyVehicleNumber: profile.emergency_vehicle_number,
      guardianPhone:         profile.guardian_phone,
      emergencyContacts:     contacts,
      conditions:            conditions.map(c => ({ type: c.condition_type, detail: c.detail })),
      medications:           medications.map(m => ({
        name:       m.medication_name,
        dosage:     m.dosage,
        isCritical: !!m.is_critical,
      })),
      generatedAt: new Date().toISOString(),
    };
  } finally {
    conn.release();
  }
}

// -------------------------------------------------------------
// Medical ID 저장/갱신 (암호화 후 DB upsert)
// -------------------------------------------------------------
async function upsertMedicalId(patientId) {
  const payload     = await buildMedicalPayload(patientId);
  const plaintext   = JSON.stringify(payload);
  const hash        = crypto.createHash('sha256').update(plaintext).digest('hex');
  const { encryptedPayload, iv, tag } = encrypt(plaintext);
  const qrToken     = crypto.randomUUID();
  const expiresAt   = new Date(Date.now() + QR_TTL_MIN * 60 * 1000);

  await db.query(
    `INSERT INTO medical_id_tokens
       (patient_id, encrypted_payload, encryption_iv, encryption_tag,
        payload_hash, qr_token, qr_token_expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       encrypted_payload   = VALUES(encrypted_payload),
       encryption_iv       = VALUES(encryption_iv),
       encryption_tag      = VALUES(encryption_tag),
       payload_hash        = VALUES(payload_hash),
       qr_token            = VALUES(qr_token),
       qr_token_expires_at = VALUES(qr_token_expires_at),
       last_generated_at   = NOW()`,
    [patientId, encryptedPayload, iv, tag, hash, qrToken, expiresAt],
  );

  return { qrToken, expiresAt };
}

// -------------------------------------------------------------
// QR 스캔 → 복호화 후 의료 데이터 반환
// -------------------------------------------------------------
async function resolveMedicalIdByQrToken(qrToken, scannerInfo = {}) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[record]] = await conn.query(
      `SELECT patient_id, encrypted_payload, encryption_iv, encryption_tag,
              payload_hash, qr_token_expires_at
       FROM   medical_id_tokens
       WHERE  qr_token = ?
       FOR UPDATE`,
      [qrToken],
    );

    const isValid = record && new Date(record.qr_token_expires_at) > new Date();

    // 감사 로그 기록
    await conn.query(
      `INSERT INTO qr_scan_logs
         (qr_token, patient_id, scanned_by, ip_address, user_agent, is_valid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        qrToken,
        record?.patient_id ?? null,
        scannerInfo.scannedBy  ?? null,
        scannerInfo.ipAddress  ?? null,
        scannerInfo.userAgent  ?? null,
        isValid ? 1 : 0,
      ],
    );

    if (!isValid) {
      await conn.commit();
      throw new Error('QR 토큰이 만료되었거나 유효하지 않습니다.');
    }

    const plaintext = decrypt(
      record.encrypted_payload,
      record.encryption_iv,
      record.encryption_tag,
    );

    // 무결성 검증
    const computedHash = crypto.createHash('sha256').update(plaintext).digest('hex');
    if (computedHash !== record.payload_hash) {
      await conn.commit();
      throw new Error('Medical ID 데이터 무결성 검증 실패');
    }

    await conn.commit();
    return JSON.parse(plaintext);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// -------------------------------------------------------------
// QR 토큰 즉시 만료 (사용자 요청 또는 보안 이벤트)
// -------------------------------------------------------------
async function revokeQrToken(patientId) {
  await db.query(
    `UPDATE medical_id_tokens
     SET    qr_token_expires_at = NOW()
     WHERE  patient_id = ?`,
    [patientId],
  );
}

module.exports = {
  upsertMedicalId,
  resolveMedicalIdByQrToken,
  revokeQrToken,
};

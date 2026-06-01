const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const db      = require('../config/database');

const BCRYPT_ROUNDS     = 12;
const ACCESS_EXPIRES    = process.env.JWT_ACCESS_EXPIRE  || '15m';
const REFRESH_EXPIRES   = process.env.JWT_REFRESH_EXPIRE || '30d';
const REFRESH_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;

// ── 토큰 발급 ─────────────────────────────────────────────────
function signAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES },
  );
}

// ── 회원가입 ─────────────────────────────────────────────────
async function register({ email, phone, password }) {
  const [[existing]] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email],
  );
  if (existing) {
    const err = new Error('이미 사용 중인 이메일입니다.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await db.query(
    'INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)',
    [email, phone ?? null, passwordHash],
  );

  return { userId: result.insertId };
}

// ── 로그인 ───────────────────────────────────────────────────
async function login({ email, password, deviceInfo }) {
  const [[user]] = await db.query(
    'SELECT id, password_hash, role, is_active FROM users WHERE email = ? AND deleted_at IS NULL',
    [email],
  );

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('비활성화된 계정입니다.');
    err.status = 403;
    throw err;
  }

  const accessToken  = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  // refresh token을 해시해서 DB 저장
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
     VALUES (?, ?, ?, ?)`,
    [user.id, tokenHash, deviceInfo ?? null, expiresAt],
  );

  return { accessToken, refreshToken, userId: user.id, role: user.role };
}

// ── 토큰 갱신 ────────────────────────────────────────────────
async function refresh(rawRefreshToken) {
  let payload;
  try {
    payload = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('유효하지 않은 refresh token입니다.');
    err.status = 401;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const [[stored]] = await db.query(
    `SELECT id, user_id FROM refresh_tokens
     WHERE token_hash = ? AND is_revoked = 0 AND expires_at > NOW()`,
    [tokenHash],
  );

  if (!stored) {
    const err = new Error('만료되었거나 폐기된 토큰입니다.');
    err.status = 401;
    throw err;
  }

  // Refresh Token Rotation: 기존 폐기 후 새로 발급
  await db.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?', [stored.id]);

  const [[user]] = await db.query('SELECT role FROM users WHERE id = ?', [payload.sub]);

  const newAccessToken  = signAccessToken(stored.user_id, user.role);
  const newRefreshToken = signRefreshToken(stored.user_id);

  const newHash   = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [stored.user_id, newHash, expiresAt],
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// ── 로그아웃 (해당 기기 토큰 폐기) ──────────────────────────
async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await db.query(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?',
    [tokenHash],
  );
}

// ── 전체 기기 로그아웃 ────────────────────────────────────────
async function logoutAll(userId) {
  await db.query(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?',
    [userId],
  );
}

module.exports = { register, login, refresh, logout, logoutAll };

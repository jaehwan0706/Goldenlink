const authService = require('../services/authService');
const db          = require('../config/database');

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   30 * 24 * 60 * 60 * 1000,   // 30일
};

// POST /auth/register
async function register(req, res) {
  const { email, phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호는 필수입니다.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
  }

  const { userId } = await authService.register({ email, phone, password });
  res.status(201).json({ message: '회원가입 완료', userId });
}

// POST /auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  const deviceInfo = req.headers['user-agent'];
  const { accessToken, refreshToken, userId, role } =
    await authService.login({ email, password, deviceInfo });

  // refresh token은 httpOnly 쿠키로 전달 (XSS 방어)
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ accessToken, userId, role });
}

// POST /auth/refresh
async function refresh(req, res) {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    return res.status(401).json({ message: 'refresh token이 없습니다.' });
  }

  const { accessToken, refreshToken } = await authService.refresh(rawToken);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ accessToken });
}

// POST /auth/logout
async function logout(req, res) {
  const rawToken = req.cookies?.refreshToken;
  await authService.logout(rawToken);

  res.clearCookie('refreshToken');
  res.json({ message: '로그아웃 완료' });
}

// POST /auth/logout-all
async function logoutAll(req, res) {
  await authService.logoutAll(req.user.sub);
  res.clearCookie('refreshToken');
  res.json({ message: '모든 기기에서 로그아웃 완료' });
}

// GET /auth/me
async function me(req, res) {
  const [[user]] = await db.query(
    'SELECT id, email, phone, role, created_at FROM users WHERE id = ?',
    [req.user.sub],
  );
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  res.json(user);
}

module.exports = { register, login, refresh, logout, logoutAll, me };

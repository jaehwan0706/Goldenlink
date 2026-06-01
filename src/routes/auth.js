const { Router }         = require('express');
const rateLimit          = require('express-rate-limit');
const ctrl               = require('../controllers/authController');
const { authenticate }   = require('../middleware/authMiddleware');

const router = Router();

// 로그인/회원가입 브루트포스 방어 (1분에 10회)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      10,
  message:  { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(err => {
    res.status(err.status ?? 500).json({ message: err.message ?? '서버 오류' });
  });

router.post('/register',    loginLimiter, wrap(ctrl.register));
router.post('/login',       loginLimiter, wrap(ctrl.login));
router.post('/refresh',                   wrap(ctrl.refresh));
router.post('/logout',                    wrap(ctrl.logout));
router.post('/logout-all',  authenticate, wrap(ctrl.logoutAll));
router.get ('/me',          authenticate, wrap(ctrl.me));

module.exports = router;

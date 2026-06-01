const { Router }       = require('express');
const rateLimit        = require('express-rate-limit');
const passSvc          = require('../services/passService');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(err =>
    res.status(err.status ?? 500).json({ message: err.message }),
  );

const passLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: '잠시 후 다시 시도해주세요.' },
});

// POST /pass/verify
// 앱에서 포트원 SDK로 인증 완료 후 imp_uid 를 여기로 전송
router.post('/verify', authenticate, passLimiter, wrap(async (req, res) => {
  const { imp_uid } = req.body;

  if (!imp_uid) {
    return res.status(400).json({ message: 'imp_uid가 필요합니다.' });
  }

  const result = await passSvc.verify({ impUid: imp_uid, userId: req.user.sub });
  res.json({ message: '본인인증 완료', ...result });
}));

module.exports = router;

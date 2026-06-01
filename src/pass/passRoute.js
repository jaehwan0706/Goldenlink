const { Router }       = require('express');
const { verifyPass }   = require('./passService');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

// POST /pass/verify
// 앱에서 포트원 SDK로 인증 완료 후 imp_uid 전송
router.post('/verify', authenticate, async (req, res) => {
  const { imp_uid } = req.body;

  if (!imp_uid) {
    return res.status(400).json({ message: 'imp_uid가 필요합니다.' });
  }

  try {
    const result = await verifyPass(imp_uid, req.user.sub);
    res.json({ message: '본인인증 완료', ...result });
  } catch (err) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

module.exports = router;

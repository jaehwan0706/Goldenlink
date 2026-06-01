const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? '토큰이 만료되었습니다.'
      : '유효하지 않은 토큰입니다.';
    res.status(401).json({ message });
  }
}

// 특정 역할만 허용
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };

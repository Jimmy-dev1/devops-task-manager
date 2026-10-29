const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

const requireSameOrigin = (req, res, next) => {
  const expectedOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
  if (req.get('origin') !== expectedOrigin) {
    return res.status(403).json({ message: 'Request origin is not allowed' });
  }
  return next();
};

module.exports = { protect, requireSameOrigin };
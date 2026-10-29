const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getCurrentUser,
  login,
  logout,
  register,
} = require('../controllers/authController');
const { protect, requireSameOrigin } = require('../middleware/authMiddleware');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts; try again later' },
});

router.post('/register', requireSameOrigin, authLimiter, register);
router.post('/login', requireSameOrigin, authLimiter, login);
router.get('/me', protect, getCurrentUser);
router.post('/logout', requireSameOrigin, protect, logout);

module.exports = router;
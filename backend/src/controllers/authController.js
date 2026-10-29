const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const {
  isValidEmail,
  isValidRegistrationPassword,
  normalizeEmail,
} = require('../validation');

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE = 60 * 60 * 1000;
const DUMMY_PASSWORD_HASH = '$2b$12$EnJopcenUUxSbh.QSnei.exy7Y1pYwX.e8AYrY3OH1W1QhWSmACBS';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true'
    || (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production'),
  sameSite: 'strict',
  path: '/api',
};

const registrationAccepted = (res) => res.status(202).json({
  message: 'If this email address is available, you can continue to log in.',
});

const register = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email) || !isValidRegistrationPassword(password)) {
      return res.status(400).json({
        message: 'Enter a valid email and a password between 12 and 72 UTF-8 bytes',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.createUser(normalizeEmail(email), passwordHash);
    return registrationAccepted(res);
  } catch (error) {
    if (error.code === '23505') {
      return registrationAccepted(res);
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = await User.findUserByEmail(normalizeEmail(email));
    const passwordHash = user ? user.password_hash : DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(password, passwordHash);
    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' },
    );

    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE });
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const getCurrentUser = (req, res) => {
  res.status(200).json({
    user: { id: req.user.id, email: req.user.email },
  });
};

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { getCurrentUser, login, logout, register };

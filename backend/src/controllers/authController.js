const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Added this import
const User = require('../models/userModel');

const register = async (req, res) => {
  // ... (Keep your existing register logic here exactly as it is) ...
  try {
    const { email, password } = req.body;
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.createUser(email, passwordHash);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// --- NEW LOGIN FUNCTION ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verify user exists
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the plain password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate the JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Data payload inside the token
      process.env.JWT_SECRET,             // The secret key from .env
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Send token to the user
    res.status(200).json({
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Make sure to export login alongside register
module.exports = { register, login };
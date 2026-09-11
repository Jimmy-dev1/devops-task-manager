const express = require('express');
const { register, login } = require('../controllers/authController'); // Added login

const router = express.Router();

router.post('/register', register);
router.post('/login', login); // Added login route

module.exports = router;
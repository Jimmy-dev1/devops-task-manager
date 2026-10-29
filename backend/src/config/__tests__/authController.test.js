const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const { login } = require('../../controllers/authController');

test('login returns a short-lived HttpOnly session cookie, not a token body', async () => {
  const secret = 'controller-test-secret-with-at-least-32-bytes';
  const passwordHash = await bcrypt.hash('existing-password', 4);
  const originalFindUserByEmail = User.findUserByEmail;
  let cookie;
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    cookie(name, value, options) {
      cookie = { name, value, options };
      return this;
    },
  };

  process.env.JWT_SECRET = secret;
  User.findUserByEmail = async (email) => {
    assert.equal(email, 'person@example.com');
    return { id: 7, email, password_hash: passwordHash };
  };

  try {
    await login({
      body: { email: ' Person@Example.com ', password: 'existing-password' },
    }, response);
  } finally {
    User.findUserByEmail = originalFindUserByEmail;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.token, undefined);
  assert.equal(cookie.name, 'access_token');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, 'strict');
  assert.equal(cookie.options.path, '/api');
  assert.equal(cookie.options.maxAge, 60 * 60 * 1000);
  assert.equal(jwt.verify(cookie.value, secret).id, 7);
});

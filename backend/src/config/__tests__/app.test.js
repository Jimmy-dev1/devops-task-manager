const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../app');

const testSecret = 'test-only-secret-with-at-least-32-bytes';
const authenticatedHeaders = () => {
  const token = jwt.sign({ id: 1, email: 'person@example.com' }, testSecret);
  return {
    Cookie: `access_token=${token}`,
    Origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  };
};

test('health endpoint reports service liveness with security headers', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('task writes reject requests from origins other than the configured app', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .set('Origin', 'https://attacker.example')
    .send({ title: 'Task' });

  assert.equal(response.status, 403);
});

test('task API requires an authenticated session cookie', async () => {
  const response = await request(app).get('/api/tasks');

  assert.equal(response.status, 401);
});

test('session endpoint accepts a signed HttpOnly-cookie session', async () => {
  process.env.JWT_SECRET = testSecret;
  const response = await request(app)
    .get('/api/auth/me')
    .set('Cookie', authenticatedHeaders().Cookie);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    user: { id: 1, email: 'person@example.com' },
  });
});

test('authentication writes reject untrusted origins before processing credentials', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .set('Origin', 'https://attacker.example')
    .send({ email: 'person@example.com', password: 'not-a-real-password' });

  assert.equal(response.status, 403);
});

test('task validation rejects invalid fields before database access', async () => {
  process.env.JWT_SECRET = testSecret;
  const headers = authenticatedHeaders();

  const createResponse = await request(app)
    .post('/api/tasks')
    .set(headers)
    .send({ title: '   ' });
  const updateResponse = await request(app)
    .put('/api/tasks/1')
    .set(headers)
    .send({ status: 'in-progress' });

  assert.equal(createResponse.status, 400);
  assert.equal(updateResponse.status, 400);
});

test('JSON request bodies above the configured limit are rejected', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .set('Origin', process.env.APP_ORIGIN || 'http://localhost:5173')
    .send({ title: 'Task', description: 'x'.repeat(33 * 1024) });

  assert.equal(response.status, 413);
});

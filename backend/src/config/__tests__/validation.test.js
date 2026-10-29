const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidEmail,
  isValidRegistrationPassword,
  isValidTaskId,
  normalizeEmail,
  validateTask,
} = require('../../validation');

test('email validation and normalization', () => {
  assert.equal(isValidEmail('person@example.com'), true);
  assert.equal(isValidEmail(' person@example.com '), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('x'.repeat(250) + '@example.com'), false);
  assert.equal(normalizeEmail('  USER@Example.com '), 'user@example.com');
});

test('registration passwords enforce bcrypt-safe byte limits and a minimum length', () => {
  assert.equal(isValidRegistrationPassword('long-enough-password'), true);
  assert.equal(isValidRegistrationPassword('short'), false);
  assert.equal(isValidRegistrationPassword('é'.repeat(37)), false);
});

test('task validation rejects blank, oversized, and non-string fields', () => {
  assert.equal(validateTask({ title: ' Ship feature ', description: 'Details' }), null);
  assert.match(validateTask({ title: '  ' }), /Title/);
  assert.match(validateTask({ title: 'x'.repeat(256) }), /Title/);
  assert.match(validateTask({ title: 'Valid', description: 42 }), /Description/);
  assert.match(validateTask({ title: 'Valid', description: 'x'.repeat(5001) }), /Description/);
});

test('task IDs must be positive safe integers', () => {
  assert.equal(isValidTaskId('12'), true);
  assert.equal(isValidTaskId('0'), false);
  assert.equal(isValidTaskId('-1'), false);
  assert.equal(isValidTaskId('1.2'), false);
  assert.equal(isValidTaskId('9007199254740992'), false);
});

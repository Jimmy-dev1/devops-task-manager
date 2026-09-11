const db = require('../config/db');

const createUser = async (email, passwordHash) => {
  // $1 and $2 safely inject variables to prevent SQL injection attacks
  const result = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail };
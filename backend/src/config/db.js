const createPool = require('./createPool');
require('dotenv').config();

const pool = createPool(
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DATABASE_URL,
  'Application',
);

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
};

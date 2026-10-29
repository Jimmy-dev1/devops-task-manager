const createPool = require('./createPool');
require('dotenv').config();

const pool = createPool(
  process.env.DB_ADMIN_USER,
  process.env.DB_ADMIN_PASSWORD,
  process.env.DB_ADMIN_DATABASE_URL,
  'Migration',
);

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  transaction,
  end: () => pool.end(),
};

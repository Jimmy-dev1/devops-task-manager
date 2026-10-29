require('dotenv').config();

const app = require('./app');
const db = require('./config/db');

const start = async () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 UTF-8 bytes');
  }

  await db.query('SELECT 1');

  const port = Number(process.env.PORT || 5000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Task Manager API listening on port ${port}`);
  });
};

if (require.main === module) {
  start().catch(async (error) => {
    console.error('API startup failed:', error);
    await db.end();
    process.exitCode = 1;
  });
}

module.exports = start;

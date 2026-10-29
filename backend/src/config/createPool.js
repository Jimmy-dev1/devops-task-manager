const { Pool } = require('pg');

const createPool = (user, password, connectionString, poolName) => {
  const pool = new Pool({
    ...(connectionString
      ? { connectionString }
      : {
        user,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password,
        port: Number(process.env.DB_PORT || 5432),
      }),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (error) => {
    console.error(`${poolName} database connection error:`, error);
    process.exit(1);
  });

  return pool;
};

module.exports = createPool;

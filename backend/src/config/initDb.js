const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('./migrationDb');

const RUNTIME_ROLE = 'taskmanager_app';

const ensureRuntimeRole = async (client) => {
  const runtimeRole = process.env.DB_USER;
  const runtimePassword = process.env.DB_PASSWORD;
  const adminRole = process.env.DB_ADMIN_USER;

  if (
    runtimeRole !== RUNTIME_ROLE
    || !runtimePassword
    || !adminRole
    || runtimeRole === adminRole
    || !process.env.DB_ADMIN_PASSWORD
  ) {
    throw new Error('Set distinct DB_USER/DB_PASSWORD and DB_ADMIN_USER/DB_ADMIN_PASSWORD values');
  }

  const result = await client.query(`
    SELECT CASE
      WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = $1)
      THEN format(
        'ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      )
      ELSE format(
        'CREATE ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      )
    END AS statement
  `, [runtimeRole, runtimePassword]);
  await client.query(result.rows[0].statement);
};

const runMigrations = async () => db.transaction(async (client) => {
  await client.query('SELECT pg_advisory_xact_lock($1)', [741852963]);
  await ensureRuntimeRole(client);

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationDirectory = path.join(__dirname, 'migrations');
  const filenames = (await fs.readdir(migrationDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  for (const filename of filenames) {
    const applied = await client.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [filename],
    );
    if (applied.rowCount > 0) continue;

    const sql = await fs.readFile(path.join(migrationDirectory, filename), 'utf8');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    console.log(`Applied database migration: ${filename}`);
  }
});

if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error('Database migration failed:', error);
      process.exitCode = 1;
    })
    .finally(() => db.end());
} else {
  module.exports = runMigrations;
}

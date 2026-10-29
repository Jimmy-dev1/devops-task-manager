CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS tasks_user_created_at_idx
  ON tasks (user_id, created_at DESC);

GRANT USAGE ON SCHEMA public TO taskmanager_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON users, tasks TO taskmanager_app;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq, tasks_id_seq TO taskmanager_app;

# DevOps Task Manager

A containerized task manager built to demonstrate a complete React, Express, and PostgreSQL application with authenticated APIs, schema migrations, automated checks, and an SSH-based deployment workflow.

## Stack

- **Frontend:** React, Vite, React Router, Axios
- **API:** Node.js 22, Express, JWT session cookies, bcrypt
- **Database:** PostgreSQL 15 with a persistent Docker volume
- **Operations:** Docker Compose, Nginx reverse proxy, GitHub Actions

## Run locally with Docker Compose

Requirements: Docker Engine and Docker Compose v2.

1. Copy `.env.example` to `.env`.
2. Replace `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, and `JWT_SECRET` with unique values (for example, generate each with `openssl rand -hex 32`). The JWT secret must be at least 32 UTF-8 bytes.
3. For local HTTP access, keep `APP_ORIGIN=http://localhost` and `COOKIE_SECURE=false`.
4. Start the application:

   ```sh
   docker compose up --build -d
   ```

5. Open <http://localhost>. The API liveness endpoint is <http://localhost/api/health>.

PostgreSQL is published only on `127.0.0.1:5432` for local development. The API is reachable through Nginx rather than through a host-published backend port. Database migrations run transactionally in a separate, one-shot container before the API starts. After a local Compose launch, remove the completed migrator container with `docker compose rm --force migrator`; it contains the database administrator credentials in its environment metadata.

## Run checks without Docker

Use Node.js 22:

```sh
cd backend
npm ci
npm test
```

```sh
cd frontend
npm ci
npm run lint
npm run build
```

For Vite development, the frontend proxies `/api` to `http://localhost:5000`. The API process uses the restricted `taskmanager_app` database role; it does not receive the PostgreSQL administrator password.

To use the Compose database with the source servers, start the database with `docker compose --env-file .env up -d database` after setting the root `.env`. Copy `backend/.env.example` to `backend/.env`; set `DB_PASSWORD` to the root `APP_DB_PASSWORD`, and `DB_ADMIN_PASSWORD` to the root `POSTGRES_PASSWORD`. Run `npm run init-db` once from `backend`, then start the backend with `npm run dev` and the Vite server from `frontend` in separate terminals.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Start a session |
| `GET` | `/api/auth/me` | Check the current session |
| `POST` | `/api/auth/logout` | Clear the current session |
| `GET` | `/api/tasks` | List the current user's tasks |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Change a task's status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

The API sets a one-hour, HttpOnly, SameSite=Strict session cookie. Mutating requests require the exact configured `APP_ORIGIN`; CORS is restricted to the same origin. Registration requires a password between 12 and 72 UTF-8 bytes. Task status is limited to `pending` and `completed`.

## Production deployment

Terminate HTTPS at a trusted load balancer or reverse proxy before exposing the application publicly. Set `APP_ORIGIN` to the public HTTPS origin and `COOKIE_SECURE=true`; never use the local HTTP settings in production. Keep `.env` on the server outside version control and provide strong, unique database and JWT secrets. The database is not exposed to the public network by this Compose configuration.

The API receives only the `taskmanager_app` credentials, which have data access to the `users` and `tasks` tables but cannot create roles, databases, or schema objects. The separate `migrator` service receives the PostgreSQL administrator credentials only while applying migrations. For an existing PostgreSQL volume from the earlier Compose configuration, the database password stored in that volume is not changed by editing `.env`; set `POSTGRES_PASSWORD` to the current database password before the first upgrade, then rotate the database password deliberately after the migration if needed.

The GitHub Actions workflow runs backend tests, validates migrations against a previous-schema fixture, audits dependencies, lints/builds the frontend, and builds both production images for pull requests and pushes to `main`. Deployment runs only after those checks pass and requires the `AWS_HOST`, `AWS_USER`, and `AWS_SSH_KEY` repository secrets. The target host must already have a correctly configured `.env` file in the checked-out project directory. The workflow updates the deployment without explicitly stopping the stack first; this is not a zero-downtime deployment guarantee.

## Security and data notes

- `.env` files are excluded from Git and Docker build contexts; `.env.example` files contain placeholders only.
- Passwords are stored as bcrypt hashes. SQL queries use parameterized values, and task queries are scoped to the authenticated user.
- API responses include security headers, and the API applies request-body limits and rate limits.
- Rate-limit counters use the in-memory store and are per API process; configure a shared store before running multiple API replicas.
- Database schema changes are recorded in `schema_migrations` and applied in order. Migration `002` maps pre-existing invalid task statuses to `pending` before enforcing the allowed-status constraint.
- Migration `003` enforces case-insensitive email uniqueness. If legacy data contains email addresses differing only by case, migration startup stops rather than deleting or merging accounts; resolve those duplicates before deploying.
- If any real secret was previously committed, removing it from the current tree does not remove it from Git history. Rotate it immediately; consider coordinated history cleanup if the repository was public or shared.

## Project layout

```text
backend/src/
  app.js
  config/
    migrations/
    __tests__/
  controllers/
  middleware/
  models/
  routes/
frontend/src/
.github/workflows/ci-cd.yml
docker-compose.yml
nginx.conf
```

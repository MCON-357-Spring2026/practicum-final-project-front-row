# Chapterly (boilerplate)

Chapterly is a digital journaling app for documenting life chapters (for example, college or a focused season of life). This repository currently contains **minimal boilerplate** only: a Node.js + Express API and a Vite + React web client.

## Repository layout

- `backend/`: Express server and PostgreSQL migrations (`backend/migrations/`).
- `frontend/`: Vite + React web client.
- `docker-compose.yml`: optional local PostgreSQL database.

## Local development

### PostgreSQL (optional but recommended)

From the repository root:

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

The `migrate` script applies SQL migrations using `DATABASE_URL` (see `backend/.env.example`). Node **20.11+** is required for `node-pg-migrate`.

If `npm run migrate` fails with **database "chapterly" does not exist**, create the database once (`createdb chapterly` on macOS with local Postgres, or use Docker Compose above which creates it automatically).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Migrations

- **Apply:** `cd backend && npm run migrate`
- **Rollback last batch:** `npm run migrate:down`
- **New migration file:** `npm run migrate:create -- <name>` (creates a timestamped file under `backend/migrations/`)

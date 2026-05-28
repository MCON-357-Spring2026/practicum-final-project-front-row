# Chapterly (boilerplate)

Chapterly is a digital journaling app for documenting life chapters (for example, college or a focused season of life). The backend provides auth, journal CRUD, Cloudinary photo uploads, and optional OpenAI/Unsplash helpers.

## Repository layout

- `backend/`: Express API, migrations, and [data model diagram](backend/docs/DATA_MODEL.md).
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

## Backend API (summary)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Get JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| GET/POST | `/api/chapters` | Bearer | List / create life chapters |
| GET/POST/PUT/DELETE | `/api/journal-entries` | Bearer | Journal CRUD |
| GET/POST/DELETE | `/api/photos` | Bearer | List / upload / delete photos |
| POST | `/api/integrations/openai/prompt` | Bearer | Suggest a journal prompt |
| POST | `/api/integrations/openai/enhance` | Bearer | Polish journal text |
| GET | `/api/integrations/unsplash/search?query=` | Bearer | Search stock photos |

Copy `backend/.env.example` to `backend/.env` and add API keys for Cloudinary, OpenAI, and Unsplash when you use those features.

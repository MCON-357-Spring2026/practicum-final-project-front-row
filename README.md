# Chapterly (boilerplate)

Chapterly is a digital journaling app for documenting life chapters (for example, college or a focused season of life). This repository currently contains **minimal boilerplate** only: a Node.js + Express API and a Vite + React web client.

## Repository layout

- `backend/`: Express server (PostgreSQL integration comes in a later step).
- `frontend/`: Vite + React web client.

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

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

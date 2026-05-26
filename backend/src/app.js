/**
 * This file builds and exports the Express application for Chapterly.
 * Keeping the app factory separate from index.js makes the server easy to test
 * with supertest without opening a real network port.
 */

import express from 'express';
import cors from 'cors';

/**
 * Creates a fresh Express app instance with baseline middleware and routes.
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  // Allow the separate frontend dev server (Vite) to call this API during development.
  app.use(cors());

  // Parse JSON request bodies for future POST/PUT routes.
  app.use(express.json());

  // Simple health check used by hosting platforms and smoke tests.
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'chapterly-api' });
  });

  return app;
}

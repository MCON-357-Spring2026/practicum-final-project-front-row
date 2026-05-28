/**
 * This file builds and exports the Express application for Chapterly.
 * Routes are grouped by feature; see docs/DATA_MODEL.md for the database layout.
 */

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes.js';
import { chapterRoutes } from './routes/chapterRoutes.js';
import { journalRoutes } from './routes/journalRoutes.js';
import { photoRoutes } from './routes/photoRoutes.js';
import { integrationRoutes } from './routes/integrationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Creates a fresh Express app instance (used by index.js and tests).
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'chapterly-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/chapters', chapterRoutes);
  app.use('/api/journal-entries', journalRoutes);
  app.use('/api/photos', photoRoutes);
  app.use('/api/integrations', integrationRoutes);

  app.use(errorHandler);

  return app;
}

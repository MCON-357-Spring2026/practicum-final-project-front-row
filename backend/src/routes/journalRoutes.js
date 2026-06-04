/**
 * This file defines CRUD routes for journal entries (stored as stories rows).
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as journalService from '../services/journalService.js';

export const journalRoutes = Router();

journalRoutes.use(requireAuth);

journalRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const chapterId = req.query.chapterId ? Number(req.query.chapterId) : undefined;
    const entries = await journalService.listJournalEntries(req.user.id, { chapterId });
    res.json({ entries });
  }),
);

journalRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await journalService.getJournalEntry(req.user.id, Number(req.params.id));
    res.json({ entry });
  }),
);

journalRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { chapterId, title, body, mood, entryDate, details } = req.body;

    if (!chapterId || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'chapterId, title, and body are required' });
    }

    const entry = await journalService.createJournalEntry(req.user.id, {
      chapterId: Number(chapterId),
      title,
      body,
      mood,
      entryDate,
      details,
    });
    res.status(201).json({ entry });
  }),
);

journalRoutes.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await journalService.updateJournalEntry(
      req.user.id,
      Number(req.params.id),
      {
        title: req.body.title,
        body: req.body.body,
        mood: req.body.mood,
      },
    );
    res.json({ entry });
  }),
);

journalRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await journalService.deleteJournalEntry(req.user.id, Number(req.params.id));
    res.status(204).send();
  }),
);

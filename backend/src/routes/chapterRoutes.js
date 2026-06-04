/**
 * This file defines routes for life chapters (containers for journal entries).
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as chapterService from '../services/chapterService.js';

export const chapterRoutes = Router();

chapterRoutes.use(requireAuth);

chapterRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const chapters = await chapterService.listChapters(req.user.id);
    res.json({ chapters });
  }),
);

chapterRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, summary, emoji, templateId, startedOn, endedOn } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const chapter = await chapterService.createChapter(req.user.id, {
      title,
      summary,
      emoji,
      templateId,
      startedOn,
      endedOn,
    });
    res.status(201).json({ chapter });
  }),
);

chapterRoutes.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const chapter = await chapterService.updateChapter(
      req.user.id,
      Number(req.params.id),
      { title },
    );
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json({ chapter });
  }),
);

chapterRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await chapterService.deleteChapter(
      req.user.id,
      Number(req.params.id),
    );
    if (!deleted) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.status(204).send();
  }),
);

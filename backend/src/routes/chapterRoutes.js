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
    const { title, summary, startedOn, endedOn } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const chapter = await chapterService.createChapter(req.user.id, {
      title,
      summary,
      startedOn,
      endedOn,
    });
    res.status(201).json({ chapter });
  }),
);

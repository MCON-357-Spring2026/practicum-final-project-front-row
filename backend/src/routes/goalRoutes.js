/**
 * This file defines CRUD routes for chapter goals.
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as goalService from '../services/goalService.js';

export const goalRoutes = Router();

goalRoutes.use(requireAuth);

goalRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const chapterId = req.query.chapterId ? Number(req.query.chapterId) : undefined;
    const goals = await goalService.listGoals(req.user.id, { chapterId });
    res.json({ goals });
  }),
);

goalRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { chapterId, title, notes } = req.body;

    if (!chapterId || !title?.trim()) {
      return res.status(400).json({ error: 'chapterId and title are required' });
    }

    const goal = await goalService.createGoal(req.user.id, {
      chapterId: Number(chapterId),
      title,
      notes,
    });
    res.status(201).json({ goal });
  }),
);

goalRoutes.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal(req.user.id, Number(req.params.id), {
      title: req.body.title,
      notes: req.body.notes,
      isCompleted: req.body.isCompleted,
    });
    res.json({ goal });
  }),
);

goalRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await goalService.deleteGoal(req.user.id, Number(req.params.id));
    res.status(204).send();
  }),
);

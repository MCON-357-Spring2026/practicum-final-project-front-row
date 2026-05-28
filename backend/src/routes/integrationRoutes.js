/**
 * This file exposes optional OpenAI and Unsplash helper endpoints.
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as openaiService from '../services/openaiService.js';
import * as unsplashService from '../services/unsplashService.js';

export const integrationRoutes = Router();

integrationRoutes.use(requireAuth);

integrationRoutes.post(
  '/openai/prompt',
  asyncHandler(async (req, res) => {
    const result = await openaiService.suggestJournalPrompt(req.body.topic);
    res.json(result);
  }),
);

integrationRoutes.post(
  '/openai/enhance',
  asyncHandler(async (req, res) => {
    const result = await openaiService.enhanceJournalText(req.body.text);
    res.json(result);
  }),
);

integrationRoutes.get(
  '/unsplash/search',
  asyncHandler(async (req, res) => {
    const result = await unsplashService.searchPhotos(req.query.query);
    res.json(result);
  }),
);

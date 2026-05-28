/**
 * This file defines photo upload and listing routes (Cloudinary-backed).
 */

import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as cloudinaryService from '../services/cloudinaryService.js';

export const photoRoutes = Router();

// Keep files in memory as a Buffer (simple for small journal photos).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

photoRoutes.use(requireAuth);

photoRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const chapterId = req.query.chapterId ? Number(req.query.chapterId) : undefined;
    const photos = await cloudinaryService.listPhotos(req.user.id, chapterId);
    res.json({ photos });
  }),
);

photoRoutes.post(
  '/upload',
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    const chapterId = Number(req.body.chapterId);

    if (!chapterId || !req.file) {
      return res.status(400).json({ error: 'chapterId and photo file are required' });
    }

    const photo = await cloudinaryService.uploadChapterPhoto(req.user.id, {
      chapterId,
      caption: req.body.caption,
      fileBuffer: req.file.buffer,
    });

    res.status(201).json({ photo });
  }),
);

photoRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await cloudinaryService.deletePhoto(req.user.id, Number(req.params.id));
    res.status(204).send();
  }),
);

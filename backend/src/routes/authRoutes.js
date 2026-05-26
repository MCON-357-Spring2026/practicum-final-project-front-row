/**
 * This file defines HTTP routes for user registration, login, and profile.
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as authService from '../services/authService.js';

export const authRoutes = Router();

function validateRegisterBody(body) {
  const { email, password } = body;
  if (!email || !password) {
    const error = new Error('email and password are required');
    error.status = 400;
    throw error;
  }
  if (String(password).length < 8) {
    const error = new Error('password must be at least 8 characters');
    error.status = 400;
    throw error;
  }
}

authRoutes.post(
  '/register',
  asyncHandler(async (req, res) => {
    validateRegisterBody(req.body);
    const result = await authService.registerUser({
      email: req.body.email,
      password: req.body.password,
      displayName: req.body.displayName,
    });
    res.status(201).json(result);
  }),
);

authRoutes.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    res.json(result);
  }),
);

authRoutes.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.id);
    res.json({ user });
  }),
);

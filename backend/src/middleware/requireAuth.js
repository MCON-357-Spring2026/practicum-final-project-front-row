/**
 * This file provides middleware that protects routes behind a signed JWT.
 * Clients send: Authorization: Bearer <token>
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

/**
 * Reads the Bearer token, verifies it, and attaches req.user = { id, email }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Signs a JWT for a logged-in user (used after register/login).
 * @param {{ id: number, email: string }} user
 */
export function signToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: '7d',
  });
}

/**
 * This file handles user registration, login, and loading the current profile.
 */

import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken } from '../middleware/requireAuth.js';

const SALT_ROUNDS = 10;

/**
 * Creates a new user and returns a JWT plus public user fields.
 */
export async function registerUser({ email, password, displayName }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (email, display_name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, display_name, created_at`,
    [normalizedEmail, displayName?.trim() || null, passwordHash],
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email });

  return { token, user: mapUser(user) };
}

/**
 * Validates email/password and returns a JWT when credentials match.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await query(
    `SELECT id, email, display_name, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [normalizedEmail],
  );

  const row = result.rows[0];
  if (!row || !row.password_hash) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const matches = await bcrypt.compare(password, row.password_hash);
  if (!matches) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = signToken({ id: row.id, email: row.email });
  return { token, user: mapUser(row) };
}

/**
 * Loads one user by primary key (for GET /api/auth/me).
 */
export async function getUserById(userId) {
  const result = await query(
    `SELECT id, email, display_name, created_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return mapUser(row);
}

function mapUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

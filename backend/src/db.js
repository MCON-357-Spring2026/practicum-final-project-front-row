/**
 * This file creates a shared PostgreSQL connection pool for the API.
 * All route handlers should use query() instead of creating new clients each time.
 */

import pg from 'pg';

const { Pool } = pg;

// When DATABASE_URL is missing (for example in a quick health-check test), pool stays null.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

/**
 * Returns true when the API can talk to PostgreSQL.
 */
export function isDatabaseConfigured() {
  return pool !== null;
}

/**
 * Runs a parameterized SQL statement against the shared pool.
 * @param {string} text - SQL with $1, $2 placeholders
 * @param {unknown[]} [params]
 */
export async function query(text, params = []) {
  if (!pool) {
    const error = new Error('DATABASE_URL is not configured');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }

  return pool.query(text, params);
}

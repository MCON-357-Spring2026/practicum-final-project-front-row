/**
 * This file centralizes API error responses so routes can throw or call next(err).
 */

/**
 * @param {Error & { status?: number, code?: string }} err
 */
export function errorHandler(err, _req, res, _next) {
  if (err.code === 'DATABASE_NOT_CONFIGURED') {
    return res.status(503).json({
      error: 'Database is not configured. Set DATABASE_URL and run migrations.',
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : 'Internal server error';

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}

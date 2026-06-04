/**
 * This file is the process entry point: it loads environment variables and starts
 * the HTTP server. Business logic stays out of here so the app stays testable.
 */

import 'dotenv/config';
import { createApp } from './app.js';

// Render (and many hosts) provide PORT; local dev uses .env or a default.
const port = Number(process.env.PORT) || 4000;
const app = createApp();

app.listen(port, () => {
  // Basic startup signal for local development and log-based hosting checks.
  console.log(`Chapterly API listening on http://localhost:${port}`);
});

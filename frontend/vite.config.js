/**
 * This file configures Vite (dev server + production bundling) and Vitest (unit tests).
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Keeps the API on 4000 and the UI on 5173 during local development.
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
});

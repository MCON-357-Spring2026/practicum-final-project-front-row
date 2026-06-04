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
    // Forward API calls to the Express backend so the browser can use relative
    // "/api/..." paths without CORS or hard-coded hostnames.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
});

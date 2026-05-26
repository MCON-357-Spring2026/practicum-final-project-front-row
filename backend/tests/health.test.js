/**
 * This file contains automated tests for the Chapterly Express API.
 * We use Node's built-in test runner so we do not need Jest configuration.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /api/health', () => {
  test('responds with JSON describing the API', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health').expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, 'chapterly-api');
  });
});

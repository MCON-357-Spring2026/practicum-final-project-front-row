/**
 * This file tests API behavior that does not require a live database or external APIs.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Auth validation', () => {
  test('register rejects missing fields', async () => {
    const app = createApp();
    const response = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /password/i);
  });

  test('login rejects missing password', async () => {
    const app = createApp();
    const response = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });

    assert.equal(response.status, 400);
  });
});

describe('Protected routes', () => {
  test('journal entries require a Bearer token', async () => {
    const app = createApp();
    const response = await request(app).get('/api/journal-entries');

    assert.equal(response.status, 401);
  });

  test('integrations require a Bearer token', async () => {
    const app = createApp();
    const response = await request(app).get('/api/integrations/unsplash/search');

    assert.equal(response.status, 401);
  });
});

describe('Journal entry validation', () => {
  test('create rejects missing body fields without auth first', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/journal-entries')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ title: 'Hi' });

    assert.equal(response.status, 401);
  });
});

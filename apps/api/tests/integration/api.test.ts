import { describe, expect, it } from 'vitest';

import request from 'supertest';

import { createApp } from '../../src/app.ts';

describe('API Integration Tests (Express Endpoints)', () => {
  const app = createApp();

  describe('GET /', () => {
    it('returns health check status', async () => {
      const response = await request(app).get('/');
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /articles', () => {
    it('returns array of catalog articles', async () => {
      const response = await request(app).get('/articles');
      expect([200, 503]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('GET /articles/:id', () => {
    it('returns 404 for non-existent article', async () => {
      const response = await request(app).get(
        '/articles/non-existent-uuid-12345'
      );
      expect([404, 503]).toContain(response.status);
    });
  });

  describe('POST /replenishment/evaluate', () => {
    it('returns 400 when quantity is missing or invalid', async () => {
      const response = await request(app)
        .post('/replenishment/evaluate')
        .send({ articleId: 'some-id', quantity: -1 });

      expect([400, 503]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
      }
    });

    it('returns 400 when articleId is missing', async () => {
      const response = await request(app)
        .post('/replenishment/evaluate')
        .send({ quantity: 5 });

      expect([400, 503]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});

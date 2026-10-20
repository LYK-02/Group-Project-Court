import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';

describe('Server Foundation & Health API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  it('GET /api/v1/health returns healthy payload when database responds', async () => {
    // Mock db.checkHealth to guarantee deterministic isolated unit/integration test
    vi.spyOn(db, 'checkHealth').mockResolvedValueOnce({
      status: 'healthy',
      latencyMs: 3,
    });

    const res = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toMatchObject({
      status: 'healthy',
      version: '1.0.0',
      database: {
        status: 'healthy',
      },
    });
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/health returns 503 degraded status when database is unreachable', async () => {
    vi.spyOn(db, 'checkHealth').mockResolvedValueOnce({
      status: 'unhealthy',
      latencyMs: 15,
      error: 'Database connection unavailable',
    });

    const res = await request(app)
      .get('/api/v1/health')
      .expect(503);

    expect(res.body.status).toBe('degraded');
    expect(res.body.database.status).toBe('unhealthy');
  });

  it('sets secure HTTP headers via Helmet', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns standard TRD JSON error response for unknown endpoints (404)', async () => {
    const res = await request(app)
      .get('/api/v1/non-existent-route')
      .expect(404);

    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/v1/non-existent-route',
        requestId: expect.any(String),
      },
    });
  });

  it('preserves client-provided X-Request-Id header when supplied', async () => {
    const customId = 'custom-test-request-id-12345';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-Id', customId);

    expect(res.headers['x-request-id']).toBe(customId);
  });
});

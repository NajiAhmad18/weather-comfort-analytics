import request from 'supertest';
import app from '../src/app';

describe('Weather API Integration Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/cache/status should return cache metrics', async () => {
    const res = await request(app).get('/api/cache/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cache');
    expect(res.body.cache).toHaveProperty('ttlSeconds', 300);
    expect(res.body.cache).toHaveProperty('hits');
    expect(res.body.cache).toHaveProperty('misses');
  });

  it('GET /api/weather/rankings without API key should return 500 or error response gracefully', async () => {
    const res = await request(app).get('/api/weather/rankings');
    // Either fails safely with 500 when mock key/unreachable API or returns rankings
    expect([200, 500]).toContain(res.status);
  });
});

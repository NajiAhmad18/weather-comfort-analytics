import request from 'supertest';
import app from '../src/app';

/**
 * Integration tests for public API endpoints.
 *
 * Auth0 env vars are intentionally absent here so the app reflects its
 * unconfigured state. Protected routes must return 503 (fail-closed), not
 * weather or cache data. The /api/health endpoint must remain public.
 */
describe('Weather API Integration Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/cache/status without Auth0 config should return 503 (fail-closed)', async () => {
    const res = await request(app).get('/api/cache/status');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Authentication service is not configured.');
    // Must NOT expose cache internals
    expect(res.body).not.toHaveProperty('cache');
  });

  it('GET /api/weather/rankings without Auth0 config should return 503 (fail-closed)', async () => {
    const res = await request(app).get('/api/weather/rankings');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Authentication service is not configured.');
    // Must NOT expose weather data
    expect(res.body).not.toHaveProperty('cities');
  });
});

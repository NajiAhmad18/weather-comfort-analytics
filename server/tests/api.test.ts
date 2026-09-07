import request from 'supertest';
import express, { Express } from 'express';
import weatherRoutes from '../src/routes/weather.routes';
import { authErrorHandler } from '../src/middleware/auth-error.middleware';

/**
 * Integration tests for public API endpoints.
 *
 * Auth0 env vars are intentionally absent so the app reflects its unconfigured
 * state. Protected routes must return 503 (fail-closed). The /api/health
 * endpoint must remain public.
 *
 * We build an isolated Express app here (rather than importing the shared
 * singleton) so that parallel test suites cannot leak AUTH0_* env vars into
 * this suite's middleware decisions.
 */
describe('Weather API Integration Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    delete process.env.AUTH0_DOMAIN;
    delete process.env.AUTH0_AUDIENCE;

    app = express();
    app.use(express.json());
    app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));
    app.use('/api', weatherRoutes);
    app.use(authErrorHandler);
  });

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

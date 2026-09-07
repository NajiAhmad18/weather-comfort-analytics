import request from 'supertest';
import express, { Express } from 'express';
import weatherRoutes from '../src/routes/weather.routes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.use('/api', weatherRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// Suite 1 — Auth0 configured: protected routes must reject unauthenticated
//            requests with 401, not pass them through.
// ---------------------------------------------------------------------------

describe('Auth0 Backend Security — Auth0 configured, no token', () => {
  let app: Express;

  beforeAll(() => {
    process.env.AUTH0_DOMAIN = 'mock-tenant.auth0.com';
    process.env.AUTH0_AUDIENCE = 'https://mock-api';
    app = buildApp();
  });

  afterAll(() => {
    delete process.env.AUTH0_DOMAIN;
    delete process.env.AUTH0_AUDIENCE;
  });

  it('GET /api/health should remain public', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/weather/rankings without Authorization token should return 401', async () => {
    const res = await request(app).get('/api/weather/rankings');
    expect(res.status).toBe(401);
  });

  it('GET /api/cache/status without Authorization token should return 401', async () => {
    const res = await request(app).get('/api/cache/status');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — FAIL CLOSED: Auth0 NOT configured — protected routes must return
//            503, not leak weather data or cache status.
// ---------------------------------------------------------------------------

describe('Auth0 Backend Security — Auth0 NOT configured (fail-closed)', () => {
  let app: Express;

  beforeAll(() => {
    // Ensure env vars are absent for this suite
    delete process.env.AUTH0_DOMAIN;
    delete process.env.AUTH0_AUDIENCE;
    app = buildApp();
  });

  it('GET /api/health should still return 200 (public endpoint)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('GET /api/weather/rankings must return 503 when Auth0 is not configured', async () => {
    const res = await request(app).get('/api/weather/rankings');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Authentication service is not configured.');
    // Must NOT contain any weather payload
    expect(res.body).not.toHaveProperty('cities');
    expect(res.body).not.toHaveProperty('rankings');
  });

  it('GET /api/cache/status must return 503 when Auth0 is not configured', async () => {
    const res = await request(app).get('/api/cache/status');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Authentication service is not configured.');
    expect(res.body).not.toHaveProperty('entries');
    expect(res.body).not.toHaveProperty('cache');
  });
});

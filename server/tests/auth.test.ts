import request from 'supertest';
import express, { Express } from 'express';
import weatherRoutes from '../src/routes/weather.routes';

describe('Auth0 Backend Security Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Set Auth0 domain and audience to trigger real middleware check
    process.env.AUTH0_DOMAIN = 'mock-tenant.auth0.com';
    process.env.AUTH0_AUDIENCE = 'https://mock-api';

    app = express();
    app.use(express.json());
    app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));
    app.use('/api', weatherRoutes);
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

  it('GET /api/weather/rankings without Authorization token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/weather/rankings');
    expect(res.status).toBe(401);
  });

  it('GET /api/cache/status without Authorization token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/cache/status');
    expect(res.status).toBe(401);
  });
});

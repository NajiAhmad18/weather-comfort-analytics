import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.config';
import weatherRoutes from './routes/weather.routes';
import { authErrorHandler } from './middleware/auth-error.middleware';

const app: Express = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', weatherRoutes);

// Must be registered after all routes.
// Converts express-oauth2-jwt-bearer errors into safe JSON responses so that
// no stack traces or filesystem paths are leaked to clients.
app.use(authErrorHandler);

export default app;

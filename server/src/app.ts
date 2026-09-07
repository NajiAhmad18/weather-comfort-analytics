import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.config';

const app: Express = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

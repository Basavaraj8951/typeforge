import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import auth from './routes/auth.js';
import tests from './routes/tests.js';
import progress from './routes/progress.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.client, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), auth);
app.use('/api/tests', rateLimit({ windowMs: 60 * 1000, limit: 60 }), tests);
app.use('/api/progress', progress);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

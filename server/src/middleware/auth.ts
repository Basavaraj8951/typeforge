import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export interface AuthRequest extends Request { userId?: string }
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.tf_token;
  if (!token || !env.jwt) return res.status(401).json({ error: 'Please log in.' });
  try { req.userId = (jwt.verify(token, env.jwt) as { sub: string }).sub; next(); }
  catch { res.status(401).json({ error: 'Your session expired. Please log in again.' }); }
}

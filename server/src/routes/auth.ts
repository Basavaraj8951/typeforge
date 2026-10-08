import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const r = Router();
const reg = z.object({
  name: z.string().trim().min(1).max(60),
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/, 'Username: 3-20 letters, numbers or underscores'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});
const login = z.object({ identifier: z.string().min(1).max(100), password: z.string().min(1).max(100) });

function sign(res: Response, id: string) {
  if (!env.jwt) throw new Error('JWT_SECRET is not set');
  const token = jwt.sign({ sub: id }, env.jwt, { expiresIn: '7d' });
  res.cookie('tf_token', token, { httpOnly: true, sameSite: 'lax', secure: env.prod, maxAge: 7 * 864e5 });
}
const pub = (u: any) => ({ id: u._id, name: u.name, username: u.username, email: u.email, role: u.role, level: u.level, xp: u.xp, bestWpm: u.bestWpm, testsCompleted: u.testsCompleted, streak: u.streak });

r.post('/register', async (req, res) => {
  const p = reg.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const { name, username, email, password } = p.data;
  if (await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] }))
    return res.status(409).json({ error: 'That email or username is already taken.' });
  const u = await User.create({ name, username, email, passwordHash: await bcrypt.hash(password, 12) });
  sign(res, u.id); res.status(201).json({ user: pub(u) });
});
r.post('/login', async (req, res) => {
  const p = login.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Enter your email or username and password.' });
  const id = p.data.identifier.toLowerCase();
  const u = await User.findOne({ $or: [{ email: id }, { username: id }] }).select('+passwordHash');
  if (!u || !(await bcrypt.compare(p.data.password, u.passwordHash)))
    return res.status(401).json({ error: 'Incorrect email/username or password.' });
  sign(res, u.id); res.json({ user: pub(u) });
});
r.post('/logout', (_req, res) => { res.clearCookie('tf_token'); res.json({ ok: true }); });
r.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const u = await User.findById(req.userId);
  if (!u) return res.status(401).json({ error: 'Please log in.' });
  res.json({ user: pub(u) });
});
export default r;

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { LEVELS, levelFor } from '../config/levels.js';
import { KINDS, LANGS, buildPractice, sanitizeCustom, type Mode } from '../config/practice.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const r = Router();
r.use(requireAuth);
const MODES = ['intermediate', 'advanced', 'pro'] as const;
const rank = (name: string) => LEVELS.findIndex(l => l.name === name);
async function level(uid?: string) { const u = await User.findById(uid); return u ? { best: u.bestWpm, name: levelFor(u.bestWpm).level } : null; }
const unlocked = (name: string, mode: Mode) => rank(name) >= rank(mode);

r.get('/options', async (req: AuthRequest, res) => {
  const me = await level(req.userId); if (!me) return res.status(401).json({ error: 'Please log in.' });
  res.json({ level: me.name, bestWpm: me.best, thresholds: Object.fromEntries(LEVELS.map(l => [l.name, l.min])), unlocked: Object.fromEntries(MODES.map(m => [m, unlocked(me.name, m)])), kinds: KINDS, langs: LANGS });
});
const q = z.object({ mode: z.enum(MODES), kind: z.string(), lang: z.enum(LANGS).default('javascript'), duration: z.coerce.number().int().min(10).max(600).default(60) });
r.get('/new', async (req: AuthRequest, res) => {
  const p = q.safeParse(req.query);
  if (!p.success || !KINDS[p.data.mode].includes(p.data.kind)) return res.status(400).json({ error: 'Invalid practice options.' });
  const me = await level(req.userId); if (!me) return res.status(401).json({ error: 'Please log in.' });
  if (!unlocked(me.name, p.data.mode)) return res.status(403).json({ error: `Reach ${LEVELS[rank(p.data.mode)].min} WPM in a typing test to unlock ${p.data.mode} practice.` });
  const text = buildPractice(p.data.mode, p.data.kind, p.data.lang, p.data.duration);
  res.json({ token: jwt.sign({ text, duration: p.data.duration, mode: p.data.mode, kind: p.data.kind, jti: randomUUID() }, env.jwt, { expiresIn: '30m' }), text, duration: p.data.duration });
});
// Custom text (pro level). Results are saved but never earn XP, level or records.
const cb = z.object({ text: z.string().max(10000), duration: z.number().int().min(10).max(600) });
r.post('/custom', async (req: AuthRequest, res) => {
  const p = cb.safeParse(req.body); const text = p.success ? sanitizeCustom(p.data.text) : null;
  if (!p.success || !text) return res.status(400).json({ error: 'Enter at least 20 characters of plain text.' });
  const me = await level(req.userId); if (!me) return res.status(401).json({ error: 'Please log in.' });
  if (!unlocked(me.name, 'pro')) return res.status(403).json({ error: 'Custom tests unlock at pro level.' });
  res.json({ token: jwt.sign({ text, duration: p.data.duration, mode: 'custom', kind: 'custom', jti: randomUUID() }, env.jwt, { expiresIn: '30m' }), text, duration: p.data.duration });
});
export default r;

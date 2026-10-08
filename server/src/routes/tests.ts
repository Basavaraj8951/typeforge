import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pickIds, textFor, validIds } from '../config/passages.js';
import { levelFor } from '../config/levels.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { scoreSubmission } from '../services/scoring.js';
import { TestResult } from '../models/TestResult.js';
import { User } from '../models/User.js';

const r = Router();
const DURATIONS = [15, 30, 60, 120, 300];
const q = z.object({
  duration: z.coerce.number().refine(d => DURATIONS.includes(d)).default(30),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  category: z.enum(['general', 'education', 'technology', 'programming', 'science', 'business', 'quotes', 'random']).default('general'),
});
// Public: guests can take a test. The signed token pins the passage, duration and start time.
r.get('/new', (req, res) => {
  const p = q.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: 'Invalid test options.' });
  const ids = pickIds(p.data.category, p.data.difficulty, p.data.duration);
  const token = jwt.sign({ ids, ...p.data, jti: randomUUID() }, env.jwt, { expiresIn: '30m' });
  res.json({ token, text: textFor(ids), duration: p.data.duration });
});

const body = z.object({
  token: z.string(), typed: z.string().max(6000), seconds: z.number().min(1).max(310),
  keystrokes: z.number().int().min(0).max(20000), wrong: z.number().int().min(0).max(20000),
  perSecond: z.array(z.number().min(-1000).max(1000)).max(320),
});
const day = (d: Date) => d.toISOString().slice(0, 10);

r.post('/result', requireAuth, async (req: AuthRequest, res) => {
  const p = body.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid result data.' });
  let t: { ids?: string[]; text?: string; mode?: string; kind?: string; duration: number; difficulty?: string; category?: string; iat: number; jti: string };
  try { t = jwt.verify(p.data.token, env.jwt) as typeof t; } catch { return res.status(400).json({ error: 'This test expired. Start a new one.' }); }
  const text = t.text ?? (t.ids && validIds(t.ids) ? textFor(t.ids) : '');
  if (!text) return res.status(400).json({ error: 'Invalid test.' });
  const real = Date.now() / 1000 - t.iat;
  if (p.data.seconds > t.duration + 1 || p.data.seconds > real + 2) return res.status(400).json({ error: 'Result timing does not match the test.' });
  if (p.data.typed.length > text.length) return res.status(400).json({ error: 'Invalid result data.' });
  if (await TestResult.exists({ tokenId: t.jti })) return res.status(409).json({ error: 'This result was already submitted.' });
  const s = scoreSubmission({ text, typed: p.data.typed, seconds: p.data.seconds, keystrokes: p.data.keystrokes, wrong: p.data.wrong, perSecond: p.data.perSecond });
  const doc = await TestResult.create({ user: req.userId, ...s, flagReasons: s.reasons, tokenId: t.jti, duration: t.duration, seconds: p.data.seconds, category: t.category, difficulty: t.difficulty, mode: t.mode ?? 'test', kind: t.kind });
  const u = await User.findById(req.userId);
  if (!u) return res.status(401).json({ error: 'Please log in.' });
  const prevLevel = u.level; let xp = 0, newBest = false;
  if (!s.flagged && s.correctChars >= 10 && t.mode !== 'custom') {
    xp = 10 + Math.round((s.wpm * s.accuracy) / 200);
    newBest = s.wpm > u.bestWpm;
    const today = day(new Date()), yest = day(new Date(Date.now() - 864e5));
    u.streak = u.lastActiveDay === today ? u.streak : u.lastActiveDay === yest ? u.streak + 1 : 1;
    u.lastActiveDay = today; u.xp += xp; u.testsCompleted += 1;
    if (newBest) u.bestWpm = s.wpm;
    u.level = levelFor(u.bestWpm).level; await u.save();
  }
  res.status(201).json({ result: { id: doc.id, ...s }, xp, newBest, flagged: s.flagged, bestWpm: u.bestWpm, level: u.level, levelUp: u.level !== prevLevel });
});
export default r;

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { LESSONS, buildText } from '../config/lessons.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { User } from '../models/User.js';
import { scoreLesson } from '../services/lessonScoring.js';

const r = Router();
r.use(requireAuth);
const idOf = (v: string) => { const n = Number(v); return Number.isInteger(n) ? LESSONS.find(l => l.id === n) : undefined; };
const unlocked = async (uid: string | undefined, id: number) => id === 1 || !!(await LessonProgress.exists({ user: uid, lessonId: id - 1, completed: true }));

r.get('/', async (req: AuthRequest, res) => {
  const ps = await LessonProgress.find({ user: req.userId }).lean(); const m = new Map(ps.map(p => [p.lessonId, p]));
  let prev = true;
  res.json({ lessons: LESSONS.map(l => { const p = m.get(l.id); const locked = !prev; prev = !!p?.completed; return { id: l.id, title: l.title, summary: l.summary, completed: !!p?.completed, bestAccuracy: p?.bestAccuracy ?? 0, bestWpm: p?.bestWpm ?? 0, locked }; }) });
});
r.get('/:id', async (req: AuthRequest, res) => {
  const l = idOf(req.params.id); if (!l) return res.status(404).json({ error: 'Lesson not found.' });
  if (!(await unlocked(req.userId, l.id))) return res.status(403).json({ error: 'Complete the previous lesson first.' });
  const text = buildText(l);
  res.json({ lesson: { id: l.id, title: l.title, instructions: l.instructions, total: LESSONS.length }, text, token: jwt.sign({ lessonId: l.id, text }, env.jwt, { expiresIn: '30m' }) });
});
const body = z.object({ token: z.string(), keystrokes: z.number().int().min(1).max(5000), wrong: z.number().int().min(0).max(5000), seconds: z.number().min(1).max(1800) });
r.post('/:id/progress', async (req: AuthRequest, res) => {
  const l = idOf(req.params.id); const p = body.safeParse(req.body);
  if (!l || !p.success) return res.status(400).json({ error: 'Invalid lesson result.' });
  let t: { lessonId: number; text: string; iat: number };
  try { t = jwt.verify(p.data.token, env.jwt) as typeof t; } catch { return res.status(400).json({ error: 'This lesson expired. Start it again.' }); }
  if (t.lessonId !== l.id) return res.status(400).json({ error: 'Invalid lesson result.' });
  if (p.data.seconds > Date.now() / 1000 - t.iat + 2) return res.status(400).json({ error: 'Result timing does not match the lesson.' });
  const s = scoreLesson({ len: t.text.length, keystrokes: p.data.keystrokes, wrong: p.data.wrong, seconds: p.data.seconds });
  if (!s.valid || s.flagged) return res.status(400).json({ error: 'This result could not be verified.' });
  const prog = (await LessonProgress.findOne({ user: req.userId, lessonId: l.id })) ?? new LessonProgress({ user: req.userId, lessonId: l.id });
  const first = s.passed && !prog.completed; let xp = 0;
  prog.attempts += 1; prog.bestAccuracy = Math.max(prog.bestAccuracy, s.accuracy); prog.bestWpm = Math.max(prog.bestWpm, s.wpm);
  if (first) { prog.completed = true; prog.completedAt = new Date(); xp = Math.round((t.text.length * s.accuracy) / 200) + 20; await User.updateOne({ _id: req.userId }, { $inc: { xp } }); }
  await prog.save();
  res.json({ accuracy: s.accuracy, wpm: s.wpm, errors: p.data.wrong, passed: s.passed, xp, nextUnlocked: s.passed && l.id < LESSONS.length });
});
export default r;

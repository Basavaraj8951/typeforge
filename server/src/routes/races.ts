import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { DIFFICULTIES, PLAYER_CAR, buildRace, placing, raceXp, standings, type Ai } from '../config/race.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Race } from '../models/Race.js';
import { User } from '../models/User.js';
import { award } from '../services/achievements.js';
import { scoreSubmission } from '../services/scoring.js';

const r = Router();
r.use(requireAuth);
const create = z.object({ difficulty: z.enum(Object.keys(DIFFICULTIES) as [keyof typeof DIFFICULTIES]).default('easy'), opponents: z.coerce.number().int().min(1).max(3).default(3) });
r.post('/', async (req: AuthRequest, res) => {
  const p = create.safeParse(req.body ?? {});
  if (!p.success) return res.status(400).json({ error: 'Invalid race options.' });
  const { text, ai } = buildRace(p.data.difficulty, p.data.opponents);
  const startsAt = new Date(Date.now() + 5000); // 2s to get ready + 3,2,1
  const doc = await Race.create({ user: req.userId, difficulty: p.data.difficulty, text, ai, startsAt });
  res.status(201).json({ id: doc.id, text, startsAt: +startsAt, serverNow: Date.now(), difficulty: p.data.difficulty, playerCar: PLAYER_CAR, ai: ai.map(a => ({ name: a.name, car: a.car, wpm: a.wpm })) });
});
const fin = z.object({ typed: z.string().max(1000), seconds: z.number().min(1).max(200), keystrokes: z.number().int().min(0).max(5000), wrong: z.number().int().min(0).max(5000), perSecond: z.array(z.number().min(-1000).max(1000)).max(210) });
r.post('/:id/finish', async (req: AuthRequest, res) => {
  const id = String(req.params.id); const p = fin.safeParse(req.body);
  if (!mongoose.isValidObjectId(id) || !p.success) return res.status(400).json({ error: 'Invalid race result.' });
  const race = await Race.findOne({ _id: id, user: req.userId });
  if (!race) return res.status(404).json({ error: 'Race not found.' });
  if (race.status !== 'created') return res.status(409).json({ error: 'This race was already submitted.' });
  if (p.data.seconds > (Date.now() - race.startsAt.getTime()) / 1000 + 2) return res.status(400).json({ error: 'Result timing does not match the race.' });
  const text = race.text, typed = p.data.typed.slice(0, text.length);
  let progress = 0; while (progress < typed.length && typed[progress] === text[progress]) progress++;
  const finished = progress === text.length && p.data.typed.length === text.length;
  const s = scoreSubmission({ text, typed, seconds: p.data.seconds, keystrokes: p.data.keystrokes, wrong: p.data.wrong, perSecond: p.data.perSecond });
  const ai = race.ai.map(a => ({ name: a.name!, car: a.car!, wpm: a.wpm!, finishSec: a.finishSec! })) as Ai[];
  const place = placing({ len: text.length, progress, finished, seconds: p.data.seconds, ai });
  const xpBase = raceXp(place, finished, s.flagged);
  const result = { place, total: ai.length + 1, finished, seconds: p.data.seconds, progress: Math.round((progress / text.length) * 100), wpm: s.wpm, accuracy: s.accuracy, errors: s.errors, flagged: s.flagged };
  const upd = await Race.updateOne({ _id: race._id, status: 'created' }, { $set: { status: 'finished', result } });
  if (upd.modifiedCount !== 1) return res.status(409).json({ error: 'This race was already submitted.' });
  let xp = xpBase; let achievements: { id: string; title: string; icon: string }[] = [];
  if (finished && !s.flagged) {
    const u = await User.findById(req.userId);
    if (u) {
      u.races += 1; if (place === 1) u.raceWins += 1;
      achievements = await award(u._id, { tests: u.testsCompleted, bestWpm: u.bestWpm, perfect: false, streak: u.streak, races: u.races, battles: 0, raceWins: u.raceWins, battleWins: 0 });
      u.xp += xpBase + achievements.length * 25; await u.save();
    }
  }
  res.json({ ...result, xp, achievements, standings: standings(ai, place, { finished, seconds: p.data.seconds, wpm: s.wpm }) });
});
r.get('/recent', async (req: AuthRequest, res) => {
  const [u, rs] = await Promise.all([User.findById(req.userId), Race.find({ user: req.userId, status: 'finished', 'result.finished': true }).sort({ createdAt: -1 }).limit(8).lean()]);
  res.json({ races: u?.races ?? 0, wins: u?.raceWins ?? 0, recent: rs.map(x => ({ difficulty: x.difficulty, place: (x.result as any).place, total: (x.result as any).total, wpm: (x.result as any).wpm, at: (x as any).createdAt })) });
});
export default r;

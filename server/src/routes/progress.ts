import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { TestResult } from '../models/TestResult.js';
import { User } from '../models/User.js';
import { levelFor } from '../config/levels.js';
import { buildAnalytics } from '../services/analytics.js';
const r = Router();
r.get('/', requireAuth, async (req: AuthRequest, res) => {
  const u = await User.findById(req.userId);
  if (!u) return res.status(401).json({ error: 'Please log in.' });
  const rs = await TestResult.find({ user: u._id, flagged: false, mode: { $ne: 'custom' } }).sort({ createdAt: -1 }).limit(30).lean();
  const last5 = rs.slice(0, 5);
  const avg = (a: number[]) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : 0);
  const miss: Record<string, number> = {};
  for (const x of rs) for (const [k, n] of Object.entries((x.errorKeys || {}) as Record<string, number>)) if (k.trim()) miss[k] = (miss[k] || 0) + n;
  const weakKeys = Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  res.json({
    stats: { currentWpm: avg(last5.map(x => x.wpm as number)), accuracy: avg(last5.map(x => x.accuracy as number)), bestWpm: u.bestWpm, testsCompleted: u.testsCompleted, streak: u.streak, xp: u.xp, ...levelFor(u.bestWpm) },
    weakKeys,
    history: rs.reverse().map(x => ({ wpm: x.wpm, accuracy: x.accuracy, at: (x as any).createdAt })),
  });
});
r.get('/analytics', requireAuth, async (req: AuthRequest, res) => {
  const range = ['7', '30', '90', 'all'].includes(String(req.query.range)) ? String(req.query.range) : '30';
  const rs = await TestResult.find({ user: req.userId, flagged: false, mode: { $ne: 'custom' } }).sort({ createdAt: -1 }).limit(1000).select('wpm accuracy consistency errorKeys createdAt').lean();
  res.json(buildAnalytics(rs as any, new Date(), range === 'all' ? null : Number(range)));
});
export default r;

import { Router } from 'express';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { UserAchievement } from '../models/UserAchievement.js';
const r = Router();
r.get('/', requireAuth, async (req: AuthRequest, res) => {
  const got = await UserAchievement.find({ user: req.userId }).lean(); const m = new Map(got.map(g => [g.achievementId, (g as any).unlockedAt as Date]));
  res.json({ achievements: ACHIEVEMENTS.map(a => ({ id: a.id, title: a.title, description: a.description, icon: a.icon, unlocked: m.has(a.id), unlockedAt: m.get(a.id) ?? null })) });
});
export default r;

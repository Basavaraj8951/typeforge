import { raceXp } from '../config/race.js';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { award } from './achievements.js';
export const battleXp = (won: boolean, durationSec: number) => (durationSec < 15 ? 0 : won ? 40 : 10);
const DAILY_CAP = 30; // rewarded multiplayer matches per player per UTC day (stops win-trading farms)
export interface Row { id: string; name: string; place: number; won?: boolean; finished?: boolean; wpm: number; accuracy: number; progress: number }
/** Saves the match and pays rewards. Needs 2+ human players; races reward finishers only; battles need 15s+. */
export async function settleMatch(room: { type: 'race' | 'battle'; code: string; quick: boolean; text: string }, rows: Row[], durationSec: number, reason: string) {
  const out = new Map<string, { xp: number; achievements: { id: string; title: string; icon: string }[] }>(); const xps = new Map<string, number>();
  const day = new Date(); day.setUTCHours(0, 0, 0, 0);
  if (rows.length >= 2) for (const r of rows) {
    const u = await User.findById(r.id); if (!u) continue; let achievements: { id: string; title: string; icon: string }[] = [];
    const today = await Match.countDocuments({ players: { $elemMatch: { user: u._id, xp: { $gt: 0 } } }, createdAt: { $gte: day } });
    let xp = 0;
    if (today < DAILY_CAP) {
      if (room.type === 'race') { xp = raceXp(r.place, !!r.finished, false); if (r.finished) { u.races += 1; if (r.place === 1) u.raceWins += 1; } }
      else if (durationSec >= 15) { xp = battleXp(!!r.won, durationSec); u.battles += 1; if (r.won) u.battleWins += 1; }
    }
    if (xp > 0) { achievements = await award(u._id, { tests: u.testsCompleted, bestWpm: u.bestWpm, perfect: false, streak: u.streak, races: u.races, battles: u.battles, raceWins: u.raceWins, battleWins: u.battleWins }); u.xp += xp + achievements.length * 25; await u.save(); }
    out.set(r.id, { xp, achievements }); xps.set(r.id, xp);
  }
  await Match.create({ ...room, reason, durationSec, players: rows.map(r => ({ user: r.id, name: r.name, place: r.place, won: r.won, wpm: r.wpm, accuracy: r.accuracy, progress: r.progress, xp: xps.get(r.id) ?? 0 })) });
  return out;
}

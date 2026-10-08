import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, earned, type AStats } from '../config/achievements.js';
const base: AStats = { tests: 0, bestWpm: 0, perfect: false, streak: 0, races: 0, battles: 0, raceWins: 0, battleWins: 0 };
const ids = (s: Partial<AStats>) => earned({ ...base, ...s }).map(a => a.id);
describe('achievements', () => {
  it('has unique ids', () => expect(new Set(ACHIEVEMENTS.map(a => a.id)).size).toBe(ACHIEVEMENTS.length));
  it('unlocks nothing at zero', () => expect(ids({})).toEqual([]));
  it('unlocks test milestones', () => { expect(ids({ tests: 10 })).toEqual(['first_test', 'tests_10']); });
  it('unlocks speed tiers', () => { const r = ids({ bestWpm: 76 }); expect(r).toContain('wpm_75'); expect(r).not.toContain('wpm_100'); });
  it('unlocks streaks and perfect runs', () => { expect(ids({ streak: 30 })).toEqual(['streak_7', 'streak_30']); expect(ids({ perfect: true })).toEqual(['perfect_accuracy']); });
  it('counts race and battle wins together', () => expect(ids({ raceWins: 6, battleWins: 4 })).toContain('wins_10'));
});

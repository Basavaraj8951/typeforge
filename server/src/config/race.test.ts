import { describe, it, expect } from 'vitest';
import { DIFFICULTIES, buildRace, placing, raceXp, standings, type Diff } from './race.js';
const ai = [{ wpm: 60, finishSec: 20 }, { wpm: 40, finishSec: 30 }];
describe('buildRace', () => {
  for (const d of Object.keys(DIFFICULTIES) as Diff[]) it(`${d}: AI speeds stay in range and text is raceable`, () => {
    const [lo, hi] = DIFFICULTIES[d];
    for (let i = 0; i < 30; i++) { const r = buildRace(d, 3); expect(r.text.length).toBeGreaterThanOrEqual(100); expect(r.text.length).toBeLessThanOrEqual(330); expect(/^[\x20-\x7E]+$/.test(r.text)).toBe(true); for (const a of r.ai) { expect(a.wpm).toBeGreaterThanOrEqual(lo); expect(a.wpm).toBeLessThanOrEqual(hi); expect(a.finishSec).toBeGreaterThan(0); } }
  });
  it('gives distinct opponents', () => { const r = buildRace('easy', 3); expect(new Set(r.ai.map(a => a.name)).size).toBe(3); });
});
describe('placing', () => {
  it('wins by finishing first', () => expect(placing({ len: 200, progress: 200, finished: true, seconds: 15, ai })).toBe(1));
  it('is second when one AI is faster', () => expect(placing({ len: 200, progress: 200, finished: true, seconds: 25, ai })).toBe(2));
  it('is last when slower than everyone', () => expect(placing({ len: 200, progress: 200, finished: true, seconds: 40, ai })).toBe(3));
  it('ties go to the player', () => expect(placing({ len: 200, progress: 200, finished: true, seconds: 20, ai })).toBe(1));
  it('ranks an unfinished player by progress', () => expect(placing({ len: 200, progress: 100, finished: false, seconds: 10, ai })).toBe(1));
  it('puts a DNF behind AIs that already finished', () => expect(placing({ len: 200, progress: 150, finished: false, seconds: 25, ai })).toBe(2));
});
describe('standings and xp', () => {
  it('inserts the player at their place', () => { const rows = standings([{ name: 'A', car: 'x', wpm: 60, finishSec: 20 }, { name: 'B', car: 'y', wpm: 40, finishSec: 30 }], 2, { finished: true, seconds: 25, wpm: 50 }); expect(rows.map(r => r.name)).toEqual(['A', 'You', 'B']); });
  it('rewards only finished clean races', () => { expect(raceXp(1, true, false)).toBe(45); expect(raceXp(4, true, false)).toBe(15); expect(raceXp(1, false, false)).toBe(0); expect(raceXp(1, true, true)).toBe(0); });
});

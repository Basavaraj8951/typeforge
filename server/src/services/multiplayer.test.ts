import { describe, it, expect } from 'vitest';
import { Typer, MAX_CPS } from './engine.js';
import { RaceEngine } from './raceEngine.js';
import { B, BattleEngine, attackName, comboOf } from './battleEngine.js';
import { battleXp } from './matchRewards.js';
import { CODE_RE, makeCode } from '../sockets/manager.js';
const text = 'hello world this is a typing race';
const type = (e: { key: (id: string, k: string, t: number) => void }, id: string, s: string, t0: number, cps = 10) => { let t = t0; for (const c of s) { e.key(id, c, t); t += 1 / cps; } return t; };
describe('Typer', () => {
  it('ignores keys before the start and non-printable keys', () => { const t = new Typer('abc'); expect(t.key('a', -0.1)).toBe(false); expect(t.key('\n', 1)).toBe(false); expect(t.key('ab', 1)).toBe(false); expect(t.typed).toBe(''); });
  it('counts wrong keystrokes and supports backspace', () => { const t = new Typer('abc'); t.key('a', 1); t.key('x', 1); expect(t.bad).toBe(1); expect(t.prefix).toBe(1); t.key('\b', 1); t.key('b', 1); expect(t.prefix).toBe(2); });
  it('blocks impossible speed', () => { const t = new Typer('a'.repeat(200)); for (let i = 0; i < 100; i++) t.key('a', 0.1); expect(t.typed.length).toBe(Math.floor(0.1 * MAX_CPS) + 3); expect(t.blocked).toBeGreaterThan(0); });
});
describe('RaceEngine', () => {
  it('ranks finishers by server time, then others by progress', () => {
    const e = new RaceEngine(text, [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }]);
    type(e, 'a', text, 0, 10); type(e, 'b', text, 0, 5); type(e, 'c', text.slice(0, 10), 0, 5);
    const r = e.results(30); expect(r.map(x => x.id)).toEqual(['a', 'b', 'c']); expect(r[2].finished).toBe(false); expect(e.done).toBe(false);
    e.leave('c'); expect(e.done).toBe(true);
  });
  it('does not finish on a wrong final character', () => { const e = new RaceEngine('abc', [{ id: 'a', name: 'A' }]); type(e, 'a', 'abx', 0, 5); expect(e.finish.has('a')).toBe(false); });
});
describe('BattleEngine', () => {
  const mk = () => new BattleEngine('a'.repeat(700), [{ id: 'p', name: 'P' }, { id: 'q', name: 'Q' }]);
  it('builds combo from correct streaks', () => { expect(comboOf(0)).toBe(1); expect(comboOf(10)).toBe(2); expect(comboOf(30)).toBe(4); expect(comboOf(500)).toBe(B.MAX_COMBO); expect(attackName(3)).toBe('Combo Attack'); });
  it('damages the opponent with correct letters', () => { const e = mk(); type(e, 'p', 'a'.repeat(20), 0, 10); expect(e.p.get('q')!.hp).toBeLessThan(100); expect(e.p.get('p')!.hp).toBe(100); });
  it('mistakes break the combo and cut power', () => { const e = mk(); type(e, 'p', 'a'.repeat(15), 0, 10); const before = e.p.get('p')!.power; e.key('p', 'x', 2); const p = e.p.get('p')!; expect(p.streak).toBe(0); expect(p.power).toBe(before - B.LOSS); expect(p.mistakes).toBe(1); });
  it('cannot farm damage by backspacing and retyping', () => { const e = mk(); type(e, 'p', 'a'.repeat(10), 0, 10); const hp = e.p.get('q')!.hp; for (let i = 0; i < 5; i++) e.key('p', '\b', 3); type(e, 'p', 'a'.repeat(5), 3, 10); expect(e.p.get('q')!.hp).toBe(hp); });
  it('ends when HP reaches zero, and forfeits end the match', () => { const e = mk(); e.p.get('q')!.hp = 0.05; type(e, 'p', 'aaaa', 0, 10); expect(e.winner).toBe('p'); expect(e.reason).toBe('hp'); const f = mk(); f.forfeit('p', 5); expect(f.winner).toBe('q'); expect(f.reason).toBe('forfeit'); });
  it('timeout goes to the player with more HP', () => { const e = mk(); e.p.get('q')!.hp = 50; e.timeout(180); expect(e.winner).toBe('p'); });
});
describe('rewards and codes', () => {
  it('battle xp', () => { expect(battleXp(true, 30)).toBe(40); expect(battleXp(false, 30)).toBe(10); expect(battleXp(true, 5)).toBe(0); });
  it('room codes look like TF-XXXX', () => { for (let i = 0; i < 50; i++) expect(CODE_RE.test(makeCode())).toBe(true); expect(CODE_RE.test('TF-8K29')).toBe(true); expect(CODE_RE.test('TF-0O1I')).toBe(false); });
  it('sanitizes custom text', () => {
    expect(sanitizeCustom('hi')).toBeNull();
    expect(sanitizeCustom('Hello\n\n  world,\tthis is   a custom test ✓ text')).toBe('Hello world, this is a custom test text');
  });
});

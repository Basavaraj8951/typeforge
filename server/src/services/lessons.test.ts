import { describe, it, expect } from 'vitest';
import { LESSONS, buildText } from '../config/lessons.js';
import { scoreLesson } from './lessonScoring.js';
const ALLOWED = new Set([...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.;/!@#$%&*():?']);
describe('lessons', () => {
  it('has 12 lessons', () => expect(LESSONS.length).toBe(12));
  it('only generates typeable characters', () => {
    for (const l of LESSONS) for (let i = 0; i < 20; i++) { const t = buildText(l); expect(t.length).toBeGreaterThan(10); for (const c of t) expect(ALLOWED.has(c), `${l.title}: ${c}`).toBe(true); }
  });
  it('drill lessons use only unlocked keys', () => {
    const l = LESSONS[1]; for (let i = 0; i < 20; i++) for (const c of buildText(l)) expect(' dkfj'.includes(c)).toBe(true);
  });
});
describe('scoreLesson', () => {
  it('passes at 90% accuracy', () => { const r = scoreLesson({ len: 45, keystrokes: 50, wrong: 5, seconds: 30 }); expect(r.passed).toBe(true); expect(r.accuracy).toBe(90); });
  it('fails below 90%', () => expect(scoreLesson({ len: 45, keystrokes: 55, wrong: 10, seconds: 30 }).passed).toBe(false));
  it('rejects inconsistent counts', () => expect(scoreLesson({ len: 45, keystrokes: 45, wrong: 3, seconds: 30 }).valid).toBe(false));
  it('flags impossible speed', () => expect(scoreLesson({ len: 500, keystrokes: 500, wrong: 0, seconds: 5 }).flagged).toBe(true));
});

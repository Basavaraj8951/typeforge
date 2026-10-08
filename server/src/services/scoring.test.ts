import { describe, it, expect } from 'vitest';
import { scoreSubmission } from './scoring.js';
import { levelFor } from '../config/levels.js';
const text = 'the quick brown fox';
describe('scoreSubmission', () => {
  it('scores a perfect run', () => {
    const r = scoreSubmission({ text, typed: text, seconds: 12, keystrokes: 19, wrong: 0, perSecond: [] });
    expect(r.accuracy).toBe(100); expect(r.wpm).toBe(19); expect(r.flagged).toBe(false);
  });
  it('does not trust understated errors', () => {
    const r = scoreSubmission({ text, typed: 'thx quick brown fox', seconds: 12, keystrokes: 19, wrong: 0, perSecond: [] });
    expect(r.errors).toBe(1); expect(r.errorKeys.e).toBe(1); expect(r.accuracy).toBeLessThan(100);
  });
  it('ignores untyped characters', () => {
    const r = scoreSubmission({ text, typed: 'the', seconds: 6, keystrokes: 3, wrong: 0, perSecond: [] });
    expect(r.accuracy).toBe(100); expect(r.incorrectChars).toBe(0);
  });
  it('flags impossible speed', () => {
    const r = scoreSubmission({ text: 'a'.repeat(900), typed: 'a'.repeat(900), seconds: 15, keystrokes: 900, wrong: 0, perSecond: [] });
    expect(r.flagged).toBe(true);
  });
});
describe('levels', () => {
  it('maps best WPM to level', () => { expect(levelFor(10).level).toBe('beginner'); expect(levelFor(50).level).toBe('advanced'); expect(levelFor(80).next).toBeNull(); });
});

import { describe, it, expect } from 'vitest';
import { wpm, rawWpm, accuracy } from './typing.js';
describe('typing maths', () => {
  it('computes WPM', () => { expect(wpm(300, 60)).toBe(60); expect(wpm(150, 30)).toBe(60); });
  it('handles zero time', () => { expect(wpm(10, 0)).toBe(0); });
  it('computes raw WPM', () => { expect(rawWpm(100, 60)).toBe(20); });
  it('computes accuracy', () => { expect(accuracy(95, 100)).toBe(95); expect(accuracy(0, 0)).toBe(100); });
});

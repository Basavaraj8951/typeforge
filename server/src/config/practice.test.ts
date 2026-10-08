import { describe, it, expect } from 'vitest';
import { KINDS, LANGS, buildPractice, sanitizeCustom, type Mode } from './practice.js';
describe('practice text', () => {
  for (const mode of Object.keys(KINDS) as Mode[]) for (const kind of KINDS[mode])
    it(`${mode}/${kind} is long enough and typeable`, () => {
      const t = buildPractice(mode, kind, 'python', 60);
      expect(t.length).toBeGreaterThanOrEqual(480); expect(/^[\x20-\x7E]+$/.test(t)).toBe(true);
    });
  it('builds every language', () => { for (const l of LANGS) expect(buildPractice('advanced', 'code', l, 30).length).toBeGreaterThan(100); });
  it('sanitizes custom text', () => {
    expect(sanitizeCustom('hi')).toBeNull();
    expect(sanitizeCustom('Hello\n\n  world,\tthis is   a custom test ✓ text')).toBe('Hello world, this is a custom test text');
  });
});

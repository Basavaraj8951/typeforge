import { describe, it, expect } from 'vitest';
import { buildAnalytics } from './analytics.js';
const now = new Date('2026-10-10T12:00:00Z');
const r = (d: string, wpm: number, accuracy = 95, errorKeys: Record<string, number> = {}) => ({ wpm, accuracy, consistency: 80, errorKeys, createdAt: new Date(d) });
const data = [r('2026-10-09T10:00:00Z', 40, 90, { E: 2, r: 1 }), r('2026-10-09T11:00:00Z', 60, 100, { e: 3 }), r('2026-09-01T10:00:00Z', 30)];
describe('buildAnalytics', () => {
  it('summarises the range', () => { const a = buildAnalytics(data, now, 30); expect(a.summary).toMatchObject({ tests: 2, avgWpm: 50, bestWpm: 60 }); });
  it('all-time includes older results', () => expect(buildAnalytics(data, now, null).summary.tests).toBe(3));
  it('merges key errors case-insensitively', () => expect(buildAnalytics(data, now, 30).keys).toEqual({ e: 5, r: 1 }));
  it('groups by day, week and month', () => {
    const a = buildAnalytics(data, now, null);
    expect(a.periods.daily.find(d => d.label === '2026-10-09')).toMatchObject({ tests: 2, avgWpm: 50 });
    expect(a.periods.monthly.map(m => m.label)).toEqual(['2026-09', '2026-10']);
    expect(a.periods.weekly.at(-1)?.label).toBe('2026-10-05');
  });
});

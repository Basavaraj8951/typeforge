export interface R { wpm: number; accuracy: number; consistency: number; errorKeys?: Record<string, number>; createdAt: Date }
const avg = (a: number[]) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : 0);
const day = (d: Date) => d.toISOString().slice(0, 10);
function weekStart(d: Date) { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return day(x); }
function group(rs: R[], keyOf: (d: Date) => string, limit: number) {
  const m = new Map<string, R[]>(); for (const r of rs) { const k = keyOf(r.createdAt); (m.get(k) ?? m.set(k, []).get(k)!).push(r); }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-limit).map(([label, x]) => ({ label, tests: x.length, avgWpm: avg(x.map(y => y.wpm)), avgAccuracy: avg(x.map(y => y.accuracy)), best: Math.max(...x.map(y => y.wpm)) }));
}
/** rangeDays = null means all time. Periods always use the full history provided. */
export function buildAnalytics(all: R[], now: Date, rangeDays: number | null) {
  const inRange = rangeDays ? all.filter(r => r.createdAt.getTime() >= now.getTime() - rangeDays * 864e5) : all;
  const chrono = [...inRange].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const keys: Record<string, number> = {};
  for (const r of inRange) for (const [k, n] of Object.entries(r.errorKeys ?? {})) { const l = k === ' ' ? ' ' : k.toLowerCase(); keys[l] = (keys[l] || 0) + n; }
  return {
    summary: { tests: inRange.length, avgWpm: avg(inRange.map(r => r.wpm)), bestWpm: inRange.length ? Math.max(...inRange.map(r => r.wpm)) : 0, avgAccuracy: avg(inRange.map(r => r.accuracy)), avgConsistency: avg(inRange.map(r => r.consistency)) },
    recent: chrono.slice(-50).map(r => ({ at: r.createdAt.toISOString(), wpm: r.wpm, accuracy: r.accuracy, consistency: r.consistency })),
    periods: { daily: group(all, day, 30), weekly: group(all, weekStart, 12), monthly: group(all, d => d.toISOString().slice(0, 7), 12) },
    keys,
  };
}

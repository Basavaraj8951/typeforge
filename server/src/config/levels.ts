// Level thresholds (best WPM). Admin-editable in a later phase; kept in one place.
export const LEVELS = [
  { name: 'beginner', min: 0 }, { name: 'intermediate', min: 25 },
  { name: 'advanced', min: 45 }, { name: 'pro', min: 70 },
] as const;
export function levelFor(bestWpm: number) {
  let cur: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (bestWpm >= l.min) cur = l;
  const next = LEVELS.find(l => l.min > bestWpm);
  return { level: cur.name, next: next ? { name: next.name, target: next.min } : null };
}

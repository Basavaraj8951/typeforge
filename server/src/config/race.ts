import { PASSAGES } from './passages.js';
export const DIFFICULTIES = { easy: [25, 40], medium: [40, 60], hard: [60, 80], expert: [80, 110] } as const;
export type Diff = keyof typeof DIFFICULTIES;
export const PLAYER_CAR = '🚗';
const NAMES = ['Nova', 'Blaze', 'Turbo', 'Comet', 'Vega', 'Rocket', 'Drift', 'Orbit', 'Zephyr', 'Ember'];
const CARS = ['🚙', '🚕', '🚓', '🏎️'];
export interface Ai { name: string; car: string; wpm: number; finishSec: number }
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const r1 = (n: number) => Math.round(n * 10) / 10;
/** 150-320 characters of plain prose, harder for harder races. No code. */
export function raceText(d: Diff): string {
  const hard = d === 'hard' || d === 'expert';
  const prose = PASSAGES.filter(p => p.category !== 'programming');
  let pool = prose.filter(p => (hard ? p.difficulty === 'hard' || p.difficulty === 'expert' : p.difficulty === 'easy' || p.difficulty === 'medium'));
  if (!pool.length) pool = prose;
  let t = shuffle(pool)[0].text;
  if (t.length < 150) { const more = shuffle(pool.filter(p => p.text !== t))[0]; if (more) t += ' ' + more.text; }
  if (t.length > 320) t = t.slice(0, 320).replace(/\s+\S*$/, '');
  return t.trim();
}
/** AI speed is fixed per race inside the difficulty range, so finish times are known to the server and cannot depend on the player. */
export function buildRace(d: Diff, opponents: number) {
  const text = raceText(d), [lo, hi] = DIFFICULTIES[d];
  const names = shuffle(NAMES), cars = shuffle(CARS);
  const ai: Ai[] = Array.from({ length: opponents }, (_, i) => {
    const wpm = r1(lo + Math.random() * (hi - lo));
    return { name: names[i], car: cars[i % cars.length], wpm, finishSec: r1(text.length / ((wpm * 5) / 60)) };
  });
  return { text, ai };
}
export const aiChars = (wpm: number, seconds: number, len: number) => Math.min(len, ((wpm * 5) / 60) * seconds);
/** 1-based place. Finished players beat AIs that finish later (ties go to the player). Others are ranked by progress at the moment they stopped. */
export function placing(p: { len: number; progress: number; finished: boolean; seconds: number; ai: Pick<Ai, 'wpm' | 'finishSec'>[] }) {
  const ahead = p.ai.filter(a => (p.finished ? a.finishSec < p.seconds : a.finishSec <= p.seconds || aiChars(a.wpm, p.seconds, p.len) > p.progress)).length;
  return ahead + 1;
}
export function standings(ai: Ai[], place: number, you: { finished: boolean; seconds: number; wpm: number }) {
  const rows: { name: string; car: string; you: boolean; finishSec: number | null; wpm: number }[] = [...ai].sort((a, b) => a.finishSec - b.finishSec).map(a => ({ name: a.name, car: a.car, you: false, finishSec: a.finishSec, wpm: a.wpm }));
  rows.splice(place - 1, 0, { name: 'You', car: PLAYER_CAR, you: true, finishSec: you.finished ? you.seconds : null, wpm: you.wpm });
  return rows;
}
/** Rewards only for finished, unflagged races. */
export const raceXp = (place: number, finished: boolean, flagged: boolean) => (!finished || flagged ? 0 : 15 + (place === 1 ? 30 : place === 2 ? 15 : place === 3 ? 5 : 0));
/** ~650-900 characters of plain prose so a battle ends by HP, not by running out of text. */
export function battleText(): string {
  const prose = shuffle(PASSAGES.filter(p => p.category !== 'programming' && p.difficulty !== 'expert'));
  let t = ''; for (let i = 0; t.length < 650; i++) t += (t ? ' ' : '') + prose[i % prose.length].text;
  return t;
}

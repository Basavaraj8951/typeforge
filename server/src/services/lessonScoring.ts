import { wpm as calcWpm } from '../utils/typing.js';
/** Lessons stop on every wrong key, so keystrokes must equal text length + wrong keystrokes. */
export function scoreLesson(p: { len: number; keystrokes: number; wrong: number; seconds: number }) {
  const valid = p.len > 0 && p.wrong >= 0 && p.keystrokes === p.len + p.wrong;
  const accuracy = p.keystrokes ? (p.len / p.keystrokes) * 100 : 0;
  const wpm = calcWpm(p.len, p.seconds);
  const flagged = wpm > 250 || p.len / p.seconds > 35;
  const r = (n: number) => Math.round(n * 10) / 10;
  return { valid, flagged, accuracy: r(accuracy), wpm: r(wpm), passed: valid && !flagged && accuracy >= 90 };
}

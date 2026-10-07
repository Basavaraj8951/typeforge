import { wpm as calcWpm, rawWpm as calcRaw } from '../utils/typing.js';
export interface Submission { text: string; typed: string; seconds: number; keystrokes: number; wrong: number; perSecond: number[] }
const r1 = (n: number) => Math.round(n * 10) / 10;
/** Recomputes every metric from the server-held passage text. Client-sent numbers are only used as bounded hints. */
export function scoreSubmission(s: Submission) {
  const typed = s.typed.slice(0, s.text.length);
  let correct = 0; const errorKeys: Record<string, number> = {};
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === s.text[i]) correct++; else { const k = s.text[i]; errorKeys[k] = (errorKeys[k] || 0) + 1; }
  }
  const incorrect = typed.length - correct;
  const keystrokes = Math.max(s.keystrokes, typed.length);
  const wrong = Math.min(keystrokes, Math.max(s.wrong, incorrect));
  const wpm = calcWpm(correct, s.seconds), rawWpm = calcRaw(typed.length, s.seconds);
  const accuracy = keystrokes ? ((keystrokes - wrong) / keystrokes) * 100 : 100;
  const samples = s.perSecond.map(x => Math.max(0, x) * 12);
  const mean = samples.reduce((a, b) => a + b, 0) / (samples.length || 1);
  const sd = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / (samples.length || 1));
  const consistency = samples.length > 2 && mean > 0 ? Math.max(0, 100 - (sd / mean) * 100) : 100;
  const reasons: string[] = [];
  if (wpm > 250) reasons.push('Speed above plausible limit');
  if (typed.length / s.seconds > 35) reasons.push('Too many characters per second');
  if (samples.length >= 10 && sd < 0.5 && mean > 60) reasons.push('Unnaturally uniform rhythm');
  return { wpm: r1(wpm), rawWpm: r1(rawWpm), accuracy: r1(accuracy), errors: wrong, consistency: r1(consistency), correctChars: correct, incorrectChars: incorrect, errorKeys, flagged: reasons.length > 0, reasons };
}

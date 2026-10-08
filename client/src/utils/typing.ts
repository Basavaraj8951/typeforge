export interface Raw { typed: string; seconds: number; keystrokes: number; wrong: number; perSecond: number[] }
export interface Res { wpm: number; rawWpm: number; cpm: number; accuracy: number; errors: number; consistency: number; correctChars: number; incorrectChars: number; errorKeys: Record<string, number> }
const r1 = (n: number) => Math.round(n * 10) / 10;
/** Local preview for guests. Logged-in results always come from the server. */
export function localScore(text: string, raw: Raw): Res {
  const typed = raw.typed.slice(0, text.length); let correct = 0; const errorKeys: Record<string, number> = {};
  for (let i = 0; i < typed.length; i++) typed[i] === text[i] ? correct++ : (errorKeys[text[i]] = (errorKeys[text[i]] || 0) + 1);
  const ks = Math.max(raw.keystrokes, typed.length), wrong = Math.min(ks, Math.max(raw.wrong, typed.length - correct));
  const s = raw.perSecond.map(x => Math.max(0, x) * 12), m = s.reduce((a, b) => a + b, 0) / (s.length || 1);
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / (s.length || 1));
  return { wpm: r1(correct / 5 / (raw.seconds / 60)), rawWpm: r1(typed.length / 5 / (raw.seconds / 60)), cpm: r1(correct / (raw.seconds / 60)), accuracy: r1(ks ? ((ks - wrong) / ks) * 100 : 100), errors: wrong, consistency: r1(s.length > 2 && m > 0 ? Math.max(0, 100 - (sd / m) * 100) : 100), correctChars: correct, incorrectChars: typed.length - correct, errorKeys };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Raw } from '../utils/typing';
export function useTypingTest(text: string, duration: number, onDone: (r: Raw) => void) {
  const [typed, setTyped] = useState(''); const [left, setLeft] = useState(duration); const [live, setLive] = useState({ wpm: 0, acc: 100 });
  const r = useRef({ typed: '', ks: 0, bad: 0, start: 0, per: [] as number[], last: 0, iv: 0 as unknown as number, done: false });
  const cb = useRef(onDone); cb.current = onDone;
  const stats = () => { const x = r.current, el = Math.max((Date.now() - x.start) / 1000, 1); let c = 0; for (let i = 0; i < x.typed.length; i++) if (x.typed[i] === text[i]) c++; return { wpm: c / 5 / (el / 60), acc: x.ks ? ((x.ks - x.bad) / x.ks) * 100 : 100, el }; };
  const finish = useCallback(() => { const x = r.current; if (x.done) return; x.done = true; clearInterval(x.iv); cb.current({ typed: x.typed, seconds: Math.max(1, Math.min(duration, (Date.now() - x.start) / 1000)), keystrokes: x.ks, wrong: x.bad, perSecond: x.per }); }, [duration]);
  const tick = () => { const x = r.current; x.per.push(x.typed.length - x.last); x.last = x.typed.length; const s = stats(); setLeft(Math.max(0, Math.ceil(duration - s.el))); setLive({ wpm: Math.round(s.wpm), acc: Math.round(s.acc) }); if (s.el >= duration) finish(); };
  const type = (c: string) => { const x = r.current; if (x.done || x.typed.length >= text.length) return; if (!x.start) { x.start = Date.now(); x.iv = window.setInterval(tick, 1000); } x.ks++; if (c !== text[x.typed.length]) x.bad++; x.typed += c; setTyped(x.typed); if (x.typed.length >= text.length) finish(); };
  const back = () => { const x = r.current; if (!x.done && x.typed.length) { x.typed = x.typed.slice(0, -1); setTyped(x.typed); } };
  useEffect(() => () => clearInterval(r.current.iv), []);
  return { typed, left, live, type, back };
}

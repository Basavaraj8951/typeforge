import { useEffect, useMemo, useRef } from 'react';
import { useTypingTest } from '../hooks/useTypingTest';
import type { Raw } from '../utils/typing';
export default function TypingArea({ text, duration, onDone }: { text: string; duration: number; onDone: (r: Raw) => void }) {
  const { typed, left, live, type, back } = useTypingTest(text, duration, onDone);
  const input = useRef<HTMLInputElement>(null); const box = useRef<HTMLDivElement>(null);
  const words = useMemo(() => { let o = 0; return text.split(/(?<= )/).map(w => { const s = o; o += w.length; return { w, s }; }); }, [text]);
  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { const c = box.current?.querySelector('[data-cur]') as HTMLElement | null; if (c && box.current) box.current.scrollTop = Math.max(0, c.offsetTop - box.current.clientHeight / 3); }, [typed]);
  return (
    <div onClick={() => input.current?.focus()}>
      <div className="flex gap-8" aria-live="off">
        {[[left, 'seconds left'], [live.wpm, 'WPM'], [live.acc + '%', 'accuracy']].map(([v, l]) => <div key={l as string}><b className="block text-3xl tabular-nums">{v}</b><span className="text-sm text-slate-500">{l}</span></div>)}
      </div>
      <div ref={box} className="relative mt-3 h-[calc(3*1.9em+28px)] cursor-text overflow-hidden whitespace-pre-wrap rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-[clamp(18px,4.6vw,24px)] leading-[1.9] text-slate-400" aria-label="Typing text">
        {words.map(({ w, s }) => <span key={s} className="inline-block whitespace-pre">{[...w].map((c, j) => { const i = s + j, t = typed[i]; const cls = i < typed.length ? (t === c ? 'text-slate-900' : 'bg-red-100 text-red-600') : ''; return <span key={j} {...(i === typed.length ? { 'data-cur': true } : {})} className={cls + (i === typed.length ? ' shadow-[-2px_0_0_#e8590c]' : '')}>{c}</span>; })}</span>)}
      </div>
      <input ref={input} aria-label="Typing input" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} value="" className="fixed left-0 top-0 h-px w-px opacity-0"
        onChange={e => { for (const c of e.target.value) type(c); }} onKeyDown={e => { if (e.key === 'Backspace') back(); }} />
      <p className="mt-2 text-sm text-slate-500">The timer starts on your first key. Backspace fixes mistakes, but they still count against accuracy.</p>
    </div>);
}

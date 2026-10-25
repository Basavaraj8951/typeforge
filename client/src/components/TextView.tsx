import { useEffect, useMemo, useRef } from 'react';
export default function TextView({ text, typed }: { text: string; typed: string }) {
  const box = useRef<HTMLDivElement>(null);
  const words = useMemo(() => { let o = 0; return text.split(/(?<= )/).map(w => { const s = o; o += w.length; return { w, s }; }); }, [text]);
  useEffect(() => { const c = box.current?.querySelector('[data-cur]') as HTMLElement | null; if (c && box.current) box.current.scrollTop = Math.max(0, c.offsetTop - box.current.clientHeight / 3); }, [typed]);
  return (
    <div ref={box} aria-label="Race text" className="relative h-[calc(3*1.9em+28px)] overflow-hidden whitespace-pre-wrap rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-[clamp(18px,4.6vw,24px)] leading-[1.9] text-slate-400">
      {words.map(({ w, s }) => <span key={s} className="inline-block whitespace-pre">{[...w].map((c, j) => { const i = s + j, t = typed[i]; const cls = i < typed.length ? (t === c ? 'text-slate-900' : 'bg-red-100 text-red-600') : ''; return <span key={j} {...(i === typed.length ? { 'data-cur': true } : {})} className={cls + (i === typed.length ? ' shadow-[-2px_0_0_#e8590c]' : '')}>{c}</span>; })}</span>)}
    </div>);
}

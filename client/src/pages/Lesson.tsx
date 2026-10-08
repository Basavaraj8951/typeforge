import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Hands from '../components/Hands';
import Keyboard, { type Fx } from '../components/Keyboard';
import { api } from '../services/api';
import { needs } from '../utils/keyboard';
interface Data { lesson: { id: number; title: string; instructions: string; total: number }; text: string; token: string }
interface Out { accuracy: number; wpm: number; errors: number; passed: boolean; xp: number; nextUnlocked: boolean }
export default function Lesson() {
  const { id } = useParams(); const [d, setD] = useState<Data | null>(null); const [err, setErr] = useState(''); const [out, setOut] = useState<Out | null>(null);
  const load = () => { setD(null); setOut(null); setErr(''); api<Data>('/lessons/' + id).then(setD).catch(e => setErr(e.message)); };
  useEffect(load, [id]);
  useEffect(() => { if (d) document.title = `Lesson ${d.lesson.id}: ${d.lesson.title} | TypeForge`; }, [d]);
  if (err) return <main className="mx-auto max-w-3xl p-4"><p role="alert" className="text-red-600">{err}</p><Link to="/learn" className="underline">Back to lessons</Link></main>;
  if (!d) return <main className="p-6 text-slate-500" role="status">Loading lesson…</main>;
  if (out) return (
    <main className="mx-auto max-w-3xl p-4"><section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-2xl font-extrabold">{out.passed ? 'Lesson complete' : 'Almost there'}</h1>
      <p className="mt-1 text-slate-600">{out.passed ? 'Nice work.' + (out.nextUnlocked ? ' The next lesson is unlocked.' : '') : 'Reach 90% accuracy to unlock the next lesson. Slow down and aim for clean keystrokes.'}</p>
      <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-5">{[[out.accuracy + '%', 'accuracy'], [out.wpm, 'WPM'], [out.errors, 'errors'], ['100%', 'completed'], ['+' + out.xp, 'XP earned']].map(([v, l]) => <div key={l as string} className="border-l-4 border-slate-200 pl-3"><b className="block text-2xl">{v}</b><span className="text-sm text-slate-500">{l}</span></div>)}</div>
      {out.passed && out.xp === 0 && <p className="text-sm text-slate-500">XP is awarded the first time you complete a lesson.</p>}
      <div className="mt-3 flex flex-wrap gap-2"><button onClick={load} className="min-h-11 rounded-lg bg-ember px-5 font-bold text-white">Repeat</button>{out.passed && out.nextUnlocked && <Link to={'/learn/' + (d.lesson.id + 1)} className="flex min-h-11 items-center rounded-lg bg-slate-900 px-5 font-bold text-white">Next lesson</Link>}<Link to="/learn" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">All lessons</Link></div>
    </section></main>);
  return <Drill key={d.token} d={d} onDone={setOut} onErr={setErr} />;
}
function Drill({ d, onDone, onErr }: { d: Data; onDone: (o: Out) => void; onErr: (e: string) => void }) {
  const { text } = d; const [i, setI] = useState(0); const [guide, setGuide] = useState(true); const [fx, setFx] = useState<Fx | null>(null); const [shake, setShake] = useState(0);
  const r = useRef({ i: 0, ks: 0, bad: 0, start: 0, done: false }); const input = useRef<HTMLInputElement>(null); const [, force] = useState(0);
  useEffect(() => { input.current?.focus(); }, []);
  const words = useMemo(() => { let o = 0; return text.split(/(?<= )/).map(w => { const s = o; o += w.length; return { w, s }; }); }, [text]);
  function press(c: string) {
    const x = r.current; if (x.done) return; if (!x.start) x.start = Date.now();
    const want = text[x.i], n = needs(c), k = n?.key; x.ks++;
    if (c === want) {
      if (k) setFx({ key: k, kind: 'hit', n: x.ks }); x.i++; setI(x.i);
      if (x.i >= text.length) { x.done = true; const seconds = Math.max(1, (Date.now() - x.start) / 1000);
        api<Out>(`/lessons/${d.lesson.id}/progress`, { token: d.token, keystrokes: x.ks, wrong: x.bad, seconds }).then(onDone).catch(e => onErr(e.message)); }
    } else { x.bad++; if (k) setFx({ key: k, kind: 'nope', n: x.ks }); setShake(s => s + 1); force(v => v + 1); }
  }
  const x = r.current, acc = x.ks ? Math.round(((x.ks - x.bad) / x.ks) * 100) : 100, el = x.start ? (Date.now() - x.start) / 60000 : 0, wpm = el > 0.03 ? Math.round(i / 5 / el) : 0;
  const t = i < text.length ? needs(text[i]) : null;
  return (
    <main className="mx-auto max-w-3xl p-4" onClick={() => input.current?.focus()}>
      <div className="flex items-center justify-between gap-2"><Link to="/learn" className="text-sm underline">All lessons</Link>
        <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={guide} onChange={e => setGuide(e.target.checked)} className="h-4 w-4" /> Show finger guide</label></div>
      <h1 className="mt-2 text-2xl font-extrabold">Lesson {d.lesson.id}: {d.lesson.title}</h1>
      <p className="mt-1 text-slate-600">{d.lesson.instructions}</p>
      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-ember transition-all" style={{ width: (i / text.length) * 100 + '%' }} /></div>
      <div className="mt-2 flex gap-6 text-sm text-slate-600"><span><b className="text-slate-900">{Math.round((i / text.length) * 100)}%</b> complete</span><span><b className="text-slate-900">{acc}%</b> accuracy</span><span><b className="text-slate-900">{wpm}</b> WPM</span><span><b className="text-slate-900">{x.bad}</b> errors</span></div>
      <div className="mt-3 min-h-[calc(2*1.9em+28px)] whitespace-pre-wrap rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-[clamp(18px,4.6vw,24px)] leading-[1.9] text-slate-400" aria-label="Lesson text">
        {words.map(({ w, s }) => <span key={s} className="inline-block whitespace-pre">{[...w].map((c, j) => { const n = s + j; return <span key={j + (n === i ? '-' + shake : '')} className={(n < i ? 'text-slate-900' : '') + (n === i ? ' k-cur ' + (shake ? 'k-nope' : '') : '')}>{c}</span>; })}</span>)}
      </div>
      <p className="mt-3 min-h-6 font-semibold" aria-live="polite">{guide && t ? t.text : ''}</p>
      {guide && <Hands active={t ? [t.finger, ...(t.shift ? [t.shift === 'L' ? 0 : 7] : [])] : []} />}
      <div className="mt-2"><Keyboard target={text[i]} guide={guide} fx={fx} /></div>
      <input ref={input} aria-label="Typing input" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} value="" className="fixed left-0 top-0 h-px w-px opacity-0" onChange={e => { for (const c of e.target.value) press(c); }} />
      <p className="mt-3 text-sm text-slate-500">A wrong key does not move you forward. Press the highlighted key to continue.</p>
    </main>);
}

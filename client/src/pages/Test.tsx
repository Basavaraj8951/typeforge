import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TypingArea from '../components/TypingArea';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import { localScore, type Raw, type Res } from '../utils/typing';
interface Round { token: string; text: string; duration: number }
interface View extends Res { saved: boolean; newBest: boolean; flagged: boolean; xp: number }
const opt = (v: string[], cur: string, set: (x: string) => void, label: string) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
    {v.map(x => <button key={x} aria-pressed={x === cur} onClick={() => set(x)} className={'min-h-10 rounded-lg px-3 text-sm capitalize ' + (x === cur ? 'bg-slate-900 text-white' : 'text-slate-600')}>{x.length < 4 || /^\d/.test(x) ? x : x}</button>)}
  </div>);
export default function Test() {
  useEffect(() => { document.title = 'Free Typing Speed Test | TypeForge'; }, []);
  const { user, load } = useAuth();
  const [s, setS] = useState({ duration: '30', difficulty: 'medium', category: 'general' });
  const [stage, setStage] = useState<'setup' | 'loading' | 'run' | 'result'>('setup');
  const [round, setRound] = useState<Round | null>(null); const [res, setRes] = useState<View | null>(null); const [err, setErr] = useState('');
  async function start() {
    setErr(''); setStage('loading');
    try { setRound(await api<Round>('/tests/new?' + new URLSearchParams(s))); setStage('run'); }
    catch (e) { setErr((e as Error).message); setStage('setup'); }
  }
  async function done(raw: Raw) {
    if (!round) return;
    setRes({ ...localScore(round.text, raw), saved: false, newBest: false, flagged: false, xp: 0 }); setStage('result');
    if (!user) return;
    try {
      const r = await api<{ result: Res; xp: number; newBest: boolean; flagged: boolean }>('/tests/result', { token: round.token, ...raw });
      setRes({ ...r.result, saved: true, newBest: r.newBest, flagged: r.flagged, xp: r.xp }); load();
    } catch (e) { setErr((e as Error).message); }
  }
  const weak = res ? Object.entries(res.errorKeys).sort((a, b) => b[1] - a[1]).slice(0, 3) : [];
  return (
    <main className="mx-auto max-w-3xl p-4">
      {stage === 'setup' && <>
        <h1 className="text-2xl font-extrabold">How fast can you type?</h1>
        <p className="mt-1 text-slate-600">Choose a test, then click the text and start typing.</p>
        <div className="mt-4 space-y-3">
          {opt(['15', '30', '60', '120', '300'], s.duration, x => setS({ ...s, duration: x }), 'Duration in seconds')}
          {opt(['easy', 'medium', 'hard', 'expert'], s.difficulty, x => setS({ ...s, difficulty: x }), 'Difficulty')}
          {opt(['general', 'education', 'technology', 'programming', 'science', 'business', 'quotes', 'random'], s.category, x => setS({ ...s, category: x }), 'Category')}
        </div>
        {err && <p role="alert" className="mt-3 text-red-600">{err}</p>}
        <button onClick={start} className="mt-5 min-h-12 rounded-xl bg-ember px-6 font-bold text-white">Start test</button>
        {!user && <p className="mt-3 text-sm text-slate-500">Guests can test freely. <Link className="underline" to="/register">Create a free account</Link> to save results and track progress.</p>}
      </>}
      {stage === 'loading' && <p className="p-8 text-slate-500" role="status">Preparing your test…</p>}
      {stage === 'run' && round && <TypingArea key={round.token} text={round.text} duration={round.duration} onDone={done} />}
      {stage === 'result' && res && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-7xl font-extrabold tracking-tight">{Math.round(res.wpm)}<small className="ml-2 text-xl font-semibold text-slate-500">WPM</small></div>
          {res.newBest && <p className="mt-1 font-bold text-green-700">Personal best!</p>}
          {res.flagged && <p className="mt-1 text-amber-700">This result was flagged for review and was not added to your stats.</p>}
          <div className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[[Math.round(res.accuracy) + '%', 'accuracy'], [Math.round(res.rawWpm), 'raw WPM'], [res.errors, 'errors'], [Math.round(res.consistency) + '%', 'consistency'], [res.correctChars, 'correct characters'], [res.incorrectChars, 'incorrect characters']].map(([v, l]) => <div key={l as string} className="border-l-4 border-slate-200 pl-3"><b className="block text-2xl">{v}</b><span className="text-sm text-slate-500">{l}</span></div>)}
          </div>
          {weak.length > 0 ? <p>Your weakest key is <b>{weak[0][0].toUpperCase()}</b>. Most mistakes: {weak.map(([k, n]) => `${k.toUpperCase()} (${n})`).join(', ')}.</p> : <p>No mistakes. Clean run.</p>}
          {res.saved ? <p className="mt-2 text-sm text-slate-500">Saved. +{res.xp} XP.</p> : user ? (err ? <p role="alert" className="mt-2 text-red-600">{err}</p> : <p className="mt-2 text-sm text-slate-500">Saving…</p>) : <p className="mt-2 text-sm">Not saved. <Link className="underline" to="/register">Create a free account</Link> to keep your results.</p>}
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={start} className="min-h-11 rounded-lg bg-ember px-5 font-bold text-white">Retry</button><button onClick={() => setStage('setup')} className="min-h-11 rounded-lg border border-slate-300 px-5">Change test</button>{user && <Link to="/dashboard" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">View statistics</Link>}</div>
        </section>)}
    </main>);
}

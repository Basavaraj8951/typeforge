import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TypingArea from './TypingArea';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import { localScore, type Raw, type Res } from '../utils/typing';
export interface Round { token: string; text: string; duration: number }
interface View extends Res { saved: boolean; newBest: boolean; flagged: boolean; xp: number; level?: string; levelUp?: boolean }
/** Runs one typing round: fetch -> type -> score -> save. Shared by the test and all practice modes. */
export default function Runner({ getRound, onBack, noRewards }: { getRound: () => Promise<Round>; onBack: () => void; noRewards?: boolean }) {
  const { user, load } = useAuth();
  const [stage, setStage] = useState<'loading' | 'run' | 'result' | 'error'>('loading');
  const [round, setRound] = useState<Round | null>(null); const [res, setRes] = useState<View | null>(null); const [err, setErr] = useState('');
  const get = useRef(getRound); get.current = getRound;
  async function start() {
    setErr(''); setStage('loading');
    try { setRound(await get.current()); setStage('run'); } catch (e) { setErr((e as Error).message); setStage('error'); }
  }
  useEffect(() => { start(); }, []);
  async function done(raw: Raw) {
    if (!round) return;
    setRes({ ...localScore(round.text, raw), saved: false, newBest: false, flagged: false, xp: 0 }); setStage('result');
    if (!user) return;
    try {
      const r = await api<{ result: Res; xp: number; newBest: boolean; flagged: boolean; level: string; levelUp: boolean }>('/tests/result', { token: round.token, ...raw });
      setRes({ ...r.result, saved: true, newBest: r.newBest, flagged: r.flagged, xp: r.xp, level: r.level, levelUp: r.levelUp }); load();
    } catch (e) { setErr((e as Error).message); }
  }
  if (stage === 'loading') return <p className="p-8 text-slate-500" role="status">Preparing your test…</p>;
  if (stage === 'error') return <div className="p-4"><p role="alert" className="text-red-600">{err}</p><button onClick={onBack} className="mt-3 min-h-11 rounded-lg border border-slate-300 px-5">Back</button></div>;
  if (stage === 'run' && round) return <TypingArea key={round.token} text={round.text} duration={round.duration} onDone={done} />;
  if (!res) return null;
  const weak = Object.entries(res.errorKeys).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const grid: [string | number, string][] = [[Math.round(res.accuracy) + '%', 'accuracy'], [Math.round(res.rawWpm), 'raw WPM'], [Math.round(res.cpm), 'characters per minute'], [res.errors, 'errors'], [Math.round(res.consistency) + '%', 'consistency'], [res.correctChars, 'correct characters'], [res.incorrectChars, 'incorrect characters']];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-7xl font-extrabold tracking-tight">{Math.round(res.wpm)}<small className="ml-2 text-xl font-semibold text-slate-500">WPM</small></div>
      {res.newBest && <p className="mt-1 font-bold text-green-700">Personal best!</p>}
      {res.levelUp && <p className="mt-1 font-bold text-ember">Level up! You are now <span className="capitalize">{res.level}</span>. <Link to="/practice" className="underline">See what you unlocked</Link></p>}
      {res.flagged && <p className="mt-1 text-amber-700">This result was flagged for review and was not added to your stats.</p>}
      <div className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{grid.map(([v, l]) => <div key={l} className="border-l-4 border-slate-200 pl-3"><b className="block text-2xl">{v}</b><span className="text-sm text-slate-500">{l}</span></div>)}</div>
      {weak.length > 0 ? <p>Your weakest key is <b>{weak[0][0].toUpperCase()}</b>. Most mistakes: {weak.map(([k, n]) => `${k.toUpperCase()} (${n})`).join(', ')}.</p> : <p>No mistakes. Clean run.</p>}
      {res.saved ? <p className="mt-2 text-sm text-slate-500">{noRewards ? 'Saved. Custom tests do not earn XP or records.' : `Saved. +${res.xp} XP.`}</p> : user ? (err ? <p role="alert" className="mt-2 text-red-600">{err}</p> : <p className="mt-2 text-sm text-slate-500">Saving…</p>) : <p className="mt-2 text-sm">Not saved. <Link className="underline" to="/register">Create a free account</Link> to keep your results.</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={start} className="min-h-11 rounded-lg bg-ember px-5 font-bold text-white">Retry</button><button onClick={onBack} className="min-h-11 rounded-lg border border-slate-300 px-5">Change test</button>
        {res.wpm < 25 && <Link to="/learn" className="flex min-h-11 items-center rounded-lg bg-slate-900 px-5 font-bold text-white">Learn touch typing</Link>}{user && <Link to="/dashboard" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">View statistics</Link>}</div>
    </section>);
}

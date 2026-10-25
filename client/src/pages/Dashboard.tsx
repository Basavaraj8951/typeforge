import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
interface P { stats: { currentWpm: number; accuracy: number; bestWpm: number; testsCompleted: number; streak: number; xp: number; level: string; next: { name: string; target: number } | null }; weakKeys: string[]; history: { wpm: number; accuracy: number }[] }
function Spark({ pts }: { pts: number[] }) {
  if (pts.length < 2) return <p className="text-sm text-slate-500">Complete two tests to see your speed trend.</p>;
  const max = Math.max(...pts, 1), min = Math.min(...pts), w = 300, h = 80;
  const d = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 8) - 4}`).join(' ');
  return <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label={`Speed over your last ${pts.length} tests`}><polyline points={d} fill="none" stroke="#e8590c" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}
export default function Dashboard() {
  useEffect(() => { document.title = 'Dashboard | TypeForge'; }, []);
  const { user } = useAuth(); const [p, setP] = useState<P | null>(null); const [err, setErr] = useState('');
  useEffect(() => { api<P>('/progress').then(setP).catch(e => setErr(e.message)); }, []);
  if (err) return <main className="p-6 text-red-600" role="alert">{err}</main>;
  if (!p) return <main className="mx-auto max-w-4xl p-4"><div className="h-8 w-64 animate-pulse rounded bg-slate-200" /><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}</div></main>;
  const s = p.stats;
  const cards: [string | number, string][] = [[s.currentWpm, 'Current WPM (last 5)'], [s.accuracy + '%', 'Accuracy'], [s.bestWpm, 'Best WPM'], [s.testsCompleted, 'Tests completed'], ['🔥 ' + s.streak, 'Day streak'], [s.xp, 'XP']];
  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-extrabold">Welcome back, {user?.username}</h1>
      <p className="mt-1 text-slate-600"><span className="capitalize font-semibold">{s.level}</span> level{s.next ? ` · next: ${s.next.name} at ${s.next.target} WPM` : ' · top level reached'}</p>
      {s.next && <div className="mt-2 h-2 overflow-hidden rounded bg-slate-200" role="progressbar" aria-valuenow={Math.min(100, Math.round((s.bestWpm / s.next.target) * 100))} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-ember" style={{ width: Math.min(100, (s.bestWpm / s.next.target) * 100) + '%' }} /></div>}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{cards.map(([v, l]) => <div key={l} className="rounded-xl border border-slate-200 bg-white p-4"><b className="text-2xl">{v}</b><p className="text-sm text-slate-500">{l}</p></div>)}</div>
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Speed over time</h2><Spark pts={p.history.map(h => h.wpm)} /></section>
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Recommendation</h2>
        <p className="mt-1 text-slate-700">{p.weakKeys.length ? `Your ${p.weakKeys.map(k => k.toUpperCase()).join(', ')} keys need practice. Slow down on words that use them.` : s.testsCompleted ? 'Great accuracy so far. Try a harder difficulty to keep improving.' : 'Take your first test to get a personal recommendation.'}</p>
        <Link to="/test" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-ember px-5 font-bold text-white">Start test</Link>{p.weakKeys.length > 0 && <Link to="/weak-practice" className="mt-3 ml-2 inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-5 font-bold text-white">Practice weak keys</Link>} <Link to="/learn" className="mt-3 ml-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-semibold">Continue lessons</Link> <Link to="/practice" className="mt-3 ml-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-semibold">Practice</Link> <Link to="/race" className="mt-3 ml-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-semibold">Race</Link> <Link to="/progress" className="mt-3 ml-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-semibold">Full statistics</Link></section>
    </main>);
}

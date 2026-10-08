import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Heatmap from '../components/Heatmap';
import Seg from '../components/Seg';
import { api } from '../services/api';
interface Period { label: string; tests: number; avgWpm: number; avgAccuracy: number; best: number }
interface A { summary: { tests: number; avgWpm: number; bestWpm: number; avgAccuracy: number; avgConsistency: number }; recent: { at: string; wpm: number; accuracy: number; consistency: number }[]; periods: Record<'daily' | 'weekly' | 'monthly', Period[]>; keys: Record<string, number> }
interface Ach { id: string; title: string; description: string; icon: string; unlocked: boolean; unlockedAt: string | null }
const RANGES: Record<string, string> = { '7 days': '7', '30 days': '30', '90 days': '90', 'all time': 'all' };
const Chart = ({ title, children }: { title: string; children: JSX.Element }) => <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">{title}</h2><div className="mt-2 h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></section>;
export default function Progress() {
  useEffect(() => { document.title = 'Typing Progress and Statistics | TypeForge'; }, []);
  const [range, setRange] = useState('30 days'); const [per, setPer] = useState('daily'); const [a, setA] = useState<A | null>(null); const [ach, setAch] = useState<Ach[]>([]); const [err, setErr] = useState('');
  useEffect(() => { setA(null); api<A>('/progress/analytics?range=' + RANGES[range]).then(setA).catch(e => setErr(e.message)); }, [range]);
  useEffect(() => { api<{ achievements: Ach[] }>('/achievements').then(r => setAch(r.achievements)).catch(() => undefined); }, []);
  if (err) return <main className="p-6 text-red-600" role="alert">{err}</main>;
  const rec = a?.recent.map((r, i) => ({ n: i + 1, d: new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), wpm: r.wpm, accuracy: r.accuracy })) ?? [];
  const hard = a ? Object.entries(a.keys).sort((x, y) => y[1] - x[1]).slice(0, 5) : [];
  const cards: [string | number, string][] = a ? [[a.summary.tests, 'Tests'], [a.summary.avgWpm, 'Average WPM'], [a.summary.bestWpm, 'Best WPM'], [a.summary.avgAccuracy + '%', 'Average accuracy'], [a.summary.avgConsistency + '%', 'Consistency']] : [];
  const unlocked = ach.filter(x => x.unlocked).length;
  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-extrabold">Your progress</h1><Seg label="Time range" v={Object.keys(RANGES)} cur={range} set={setRange} /></div>
      {!a && <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{[...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}</div>}
      {a && a.summary.tests === 0 && <section className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-bold">No tests in this range yet</p><p className="mt-1 text-slate-600">Complete a typing test and your speed, accuracy and weak keys will appear here.</p><Link to="/test" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-ember px-5 font-bold text-white">Take a test</Link></section>}
      {a && a.summary.tests > 0 && <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{cards.map(([v, l]) => <div key={l} className="rounded-xl border border-slate-200 bg-white p-4"><b className="text-2xl">{v}</b><p className="text-sm text-slate-500">{l}</p></div>)}</div>
        <Chart title="WPM per test"><LineChart data={rec}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="d" tick={{ fontSize: 11 }} minTickGap={24} /><YAxis tick={{ fontSize: 11 }} width={32} /><Tooltip /><Line type="monotone" dataKey="wpm" name="WPM" stroke="#e8590c" strokeWidth={2.5} dot={false} /></LineChart></Chart>
        <Chart title="Accuracy per test"><LineChart data={rec}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="d" tick={{ fontSize: 11 }} minTickGap={24} /><YAxis domain={[50, 100]} tick={{ fontSize: 11 }} width={32} /><Tooltip /><Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#1c7ed6" strokeWidth={2.5} dot={false} /></LineChart></Chart>
        <section className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Average WPM by period</h2><Seg label="Period" v={['daily', 'weekly', 'monthly']} cur={per} set={setPer} /></div>
          <Chart title={per === 'daily' ? 'Last 30 days' : per === 'weekly' ? 'Last 12 weeks' : 'Last 12 months'}><BarChart data={a.periods[per as 'daily']}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={16} /><YAxis tick={{ fontSize: 11 }} width={32} /><Tooltip /><Bar dataKey="avgWpm" name="Avg WPM" fill="#e8590c" radius={[4, 4, 0, 0]} /></BarChart></Chart></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Keyboard heatmap</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">{hard.length ? <>Your weakest key is <b>{hard[0][0] === ' ' ? 'space' : hard[0][0].toUpperCase()}</b>. Practice it with a targeted drill.</> : 'No mistakes in this range. Excellent accuracy.'}</p>
          <Heatmap counts={a.keys} />{hard.length > 0 && <Link to="/weak-practice" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-ember px-5 font-bold text-white">Practice weak keys</Link>}</section></>}
      <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Achievements <span className="font-normal text-slate-500">· {unlocked} of {ach.length}</span></h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{ach.map(x => <li key={x.id} className={'flex items-center gap-3 rounded-lg border p-3 ' + (x.unlocked ? 'border-green-300 bg-green-50' : 'border-slate-200 opacity-60')}><span className="text-2xl" aria-hidden="true">{x.unlocked ? x.icon : '🔒'}</span><div><b className="block leading-tight">{x.title}</b><span className="text-sm text-slate-600">{x.description}</span></div></li>)}</ul></section>
    </main>);
}

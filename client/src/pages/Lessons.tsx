import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
interface L { id: number; title: string; summary: string; completed: boolean; bestAccuracy: number; bestWpm: number; locked: boolean }
export default function Lessons() {
  useEffect(() => { document.title = 'Touch Typing Lessons for Beginners | TypeForge'; }, []);
  const [ls, setLs] = useState<L[] | null>(null); const [err, setErr] = useState('');
  useEffect(() => { api<{ lessons: L[] }>('/lessons').then(r => setLs(r.lessons)).catch(e => setErr(e.message)); }, []);
  const done = ls?.filter(l => l.completed).length ?? 0;
  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-extrabold">Learn touch typing</h1>
      <p className="mt-1 text-slate-600">Twelve short lessons that teach every finger its keys. Finish a lesson with 90% accuracy to unlock the next one.</p>
      {err && <p role="alert" className="mt-3 text-red-600">{err}</p>}
      {!ls && !err && <div className="mt-4 grid gap-3 sm:grid-cols-2">{[...Array(6)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}</div>}
      {ls && <>
        <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={ls.length} aria-label="Lessons completed"><div className="h-full bg-ember" style={{ width: (done / ls.length) * 100 + '%' }} /></div>
        <p className="mt-1 text-sm text-slate-500">{done} of {ls.length} complete</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{ls.map(l => {
          const body = <><b>Lesson {l.id}: {l.title}</b><p className="text-sm text-slate-600">{l.summary}</p><p className="mt-1 text-sm font-semibold">{l.completed ? <span className="text-green-700">Complete · {l.bestAccuracy}% accuracy · {l.bestWpm} WPM</span> : l.locked ? <span className="text-slate-400">Locked</span> : <span className="text-ember">Start</span>}</p></>;
          return l.locked ? <div key={l.id} aria-disabled className="rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70">{body}</div> : <Link key={l.id} to={'/learn/' + l.id} className={'rounded-xl border bg-white p-4 hover:shadow ' + (l.completed ? 'border-green-300' : 'border-slate-200')}>{body}</Link>;
        })}</div></>}
    </main>);
}

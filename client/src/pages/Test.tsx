import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Runner, { type Round } from '../components/Runner';
import Seg from '../components/Seg';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
export default function Test() {
  useEffect(() => { document.title = 'Free Typing Speed Test | TypeForge'; }, []);
  const { user } = useAuth(); const [s, setS] = useState({ duration: '30', difficulty: 'medium', category: 'general' }); const [run, setRun] = useState(0);
  if (run) return <main className="mx-auto max-w-3xl p-4"><Runner key={run} getRound={() => api<Round>('/tests/new?' + new URLSearchParams(s))} onBack={() => setRun(0)} /></main>;
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-extrabold">How fast can you type?</h1>
      <p className="mt-1 text-slate-600">Choose a test, then click the text and start typing.</p>
      <div className="mt-4 space-y-3">
        <Seg label="Duration in seconds" v={['15', '30', '60', '120', '300']} cur={s.duration} set={x => setS({ ...s, duration: x })} />
        <Seg label="Difficulty" v={['easy', 'medium', 'hard', 'expert']} cur={s.difficulty} set={x => setS({ ...s, difficulty: x })} />
        <Seg label="Category" v={['general', 'education', 'technology', 'programming', 'science', 'business', 'quotes', 'random']} cur={s.category} set={x => setS({ ...s, category: x })} />
      </div>
      <button onClick={() => setRun(Date.now())} className="mt-5 min-h-12 rounded-xl bg-ember px-6 font-bold text-white">Start test</button>
      {!user && <p className="mt-3 text-sm text-slate-500">Guests can test freely. <Link className="underline" to="/register">Create a free account</Link> to save results and track progress.</p>}
    </main>);
}

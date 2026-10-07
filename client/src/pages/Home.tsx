import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6 pt-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Master Typing. Increase Your Speed. Compete With Everyone.</h1>
      <p className="mt-3 text-slate-600">Learn touch typing, improve your accuracy, race your friends, battle real players, and track your progress.</p>
      <div className="mt-6 flex gap-3"><Link to="/register" className="rounded-lg bg-ember px-5 py-3 font-bold text-white">Start Typing Free</Link><Link to="/login" className="rounded-lg border border-slate-300 px-5 py-3">Log in</Link></div>
    </main>);
}

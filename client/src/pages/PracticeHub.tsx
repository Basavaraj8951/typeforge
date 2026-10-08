import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOptions } from './Practice';
const L = [['/learn', 'Beginner', 'Touch-typing lessons with a finger guide.', 'beginner'], ['/intermediate', 'Intermediate', 'Words, sentences, numbers and punctuation.', 'intermediate'], ['/advanced', 'Advanced', 'Long paragraphs, symbols and code in 8 languages.', 'advanced'], ['/pro', 'Pro', 'Extreme speed, long-form and custom tests.', 'pro']];
export default function PracticeHub() {
  useEffect(() => { document.title = 'Typing Practice for Every Level | TypeForge'; }, []);
  const { o, err } = useOptions();
  if (err) return <main className="p-6 text-red-600" role="alert">{err}</main>;
  if (!o) return <main className="p-6 text-slate-500" role="status">Loading…</main>;
  return (
    <main className="mx-auto max-w-4xl p-4"><h1 className="text-2xl font-extrabold">Practice</h1>
      <p className="mt-1 text-slate-600">Your level is <b className="capitalize">{o.level}</b> (best {o.bestWpm} WPM). Higher levels unlock as your speed grows.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{L.map(([to, t, d, k]) => { const open = k === 'beginner' || o.unlocked[k as 'pro']; const body = <><b>{t}</b><p className="text-sm text-slate-600">{d}</p><p className="mt-1 text-sm font-semibold">{open ? <span className="text-ember">Open</span> : <span className="text-slate-400">Locked · reach {o.thresholds[k]} WPM</span>}</p></>;
        return open ? <Link key={to} to={to} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow">{body}</Link> : <Link key={to} to={to} className="rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-80">{body}</Link>; })}</div>
    </main>);
}

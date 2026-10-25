import { useEffect } from 'react';
import { Link } from 'react-router-dom';
const steps = [['Beginner', '0–25 WPM', 'Learn finger placement and accuracy.'], ['Intermediate', '25–45 WPM', 'Build rhythm with real words.'], ['Advanced', '45–70 WPM', 'Handle punctuation, numbers and code.'], ['Pro', '70+ WPM', 'Compete on speed and consistency.']];
const faq = [['Is TypeForge free?', 'Yes. Typing tests and statistics are free. Guests can test without an account.'], ['How is WPM calculated?', 'Correct characters divided by five, divided by minutes. Accuracy counts every wrong keystroke, even ones you fix.'], ['Can results be faked?', 'No. Saved results are recalculated on the server from the exact passage you were given.']];
export default function Home() {
  useEffect(() => { document.title = 'TypeForge – Free Typing Test and Typing Speed Practice'; }, []);
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:pt-20">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Master Typing. Increase Your Speed. Compete With Everyone.</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">Learn touch typing, improve your accuracy, race your friends, battle real players, and track your progress.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/test" className="flex min-h-12 items-center rounded-xl bg-ember px-6 font-bold text-white">Start Typing Free</Link><Link to="/learn" className="flex min-h-12 items-center rounded-xl border border-slate-300 px-6 font-semibold">Learn touch typing</Link><Link to="/race" className="flex min-h-12 items-center rounded-xl border border-slate-300 px-6 font-semibold">Enter a Race</Link><Link to="/register" className="flex min-h-12 items-center rounded-xl border border-slate-300 px-6 font-semibold">Create account</Link></div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-8"><h2 className="text-2xl font-extrabold">Your path from beginner to pro</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">{steps.map(([n, w, d]) => <li key={n} className="rounded-xl border border-slate-200 bg-white p-4"><b>{n}</b><p className="text-sm font-semibold text-ember">{w}</p><p className="mt-1 text-sm text-slate-600">{d}</p></li>)}</ol></section>
      <section className="mx-auto max-w-5xl px-4 py-8"><h2 className="text-2xl font-extrabold">Why TypeForge?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['Honest numbers', 'Scores are verified by the server, so a high WPM means something.'], ['Know your weak keys', 'Every test shows which keys cost you accuracy.'], ['Free to start', 'Tests, statistics and streaks cost nothing.']].map(([t, d]) => <div key={t} className="rounded-xl border border-slate-200 bg-white p-4"><b>{t}</b><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div></section>
      <section className="mx-auto max-w-5xl px-4 py-8"><h2 className="text-2xl font-extrabold">Questions</h2>{faq.map(([q, a]) => <details key={q} className="mt-2 rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-slate-600">{a}</p></details>)}</section>
      <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">© TypeForge</footer>
    </main>);
}

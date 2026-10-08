import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Runner, { type Round } from '../components/Runner';
import Seg from '../components/Seg';
import { api } from '../services/api';
type Mode = 'intermediate' | 'advanced' | 'pro';
interface Opts { level: string; bestWpm: number; thresholds: Record<string, number>; unlocked: Record<Mode, boolean>; kinds: Record<Mode, string[]>; langs: string[] }
export function useOptions() { const [o, setO] = useState<Opts | null>(null); const [err, setErr] = useState(''); useEffect(() => { api<Opts>('/practice/options').then(setO).catch(e => setErr(e.message)); }, []); return { o, err }; }
const CFG: Record<Mode, { title: string; intro: string; durs: string[] }> = {
  intermediate: { title: 'Intermediate practice', intro: 'Build rhythm with everyday words, sentences, numbers and punctuation.', durs: ['30', '60', '120', 'custom'] },
  advanced: { title: 'Advanced typing', intro: 'Long paragraphs, difficult vocabulary, symbols and real code snippets.', durs: ['30', '60', '120', '300'] },
  pro: { title: 'Pro mode', intro: 'Extreme speed, long-form endurance, mixed programming and your own custom text.', durs: ['60', '120', '300', 'custom'] },
};
export default function Practice({ mode }: { mode: Mode }) {
  const c = CFG[mode]; const { o, err } = useOptions();
  useEffect(() => { document.title = `${c.title} | TypeForge`; }, [c.title]);
  const [kind, setKind] = useState(mode === 'pro' ? 'extreme' : mode === 'advanced' ? 'paragraphs' : 'words');
  const [dur, setDur] = useState(c.durs[1]); const [custom, setCustom] = useState('45'); const [lang, setLang] = useState('javascript'); const [text, setText] = useState(''); const [run, setRun] = useState(0); const [formErr, setFormErr] = useState('');
  if (err) return <main className="p-6 text-red-600" role="alert">{err}</main>;
  if (!o) return <main className="p-6 text-slate-500" role="status">Loading…</main>;
  if (!o.unlocked[mode]) return (
    <main className="mx-auto max-w-xl p-4"><h1 className="text-2xl font-extrabold">{c.title}</h1>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5"><p className="font-bold">Locked</p><p className="mt-1 text-slate-600">Reach <b>{o.thresholds[mode]} WPM</b> in a typing test to unlock this level. Your best so far is <b>{o.bestWpm} WPM</b>.</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link to="/test" className="flex min-h-11 items-center rounded-lg bg-ember px-5 font-bold text-white">Take a typing test</Link><Link to="/learn" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">Learn touch typing</Link></div></div></main>);
  const seconds = dur === 'custom' ? Math.min(600, Math.max(10, Number(custom) || 60)) : Number(dur);
  const isCustomText = mode === 'pro' && kind === 'custom'; const needsLang = (mode === 'advanced' && kind === 'code') || (mode === 'pro' && kind === 'programming');
  const getRound = () => isCustomText ? api<Round>('/practice/custom', { text, duration: seconds }) : api<Round>('/practice/new?' + new URLSearchParams({ mode, kind, lang, duration: String(seconds) }));
  if (run) return <main className="mx-auto max-w-3xl p-4"><Runner key={run} getRound={getRound} noRewards={isCustomText} onBack={() => setRun(0)} /></main>;
  function go() { if (isCustomText && text.replace(/\s+/g, ' ').trim().length < 20) return setFormErr('Enter at least 20 characters of text.'); setFormErr(''); setRun(Date.now()); }
  const kinds = mode === 'pro' ? [...o.kinds.pro, 'custom'] : o.kinds[mode];
  return (
    <main className="mx-auto max-w-3xl p-4"><h1 className="text-2xl font-extrabold">{c.title}</h1><p className="mt-1 text-slate-600">{c.intro}</p>
      <div className="mt-4 space-y-3">
        <Seg label="Practice type" v={kinds} cur={kind} set={setKind} />
        {needsLang && <Seg label="Language" v={o.langs} cur={lang} set={setLang} />}
        <Seg label="Duration in seconds" v={c.durs} cur={dur} set={setDur} />
        {dur === 'custom' && <label className="block text-sm font-medium">Seconds (10–600)<input type="number" min={10} max={600} value={custom} onChange={e => setCustom(e.target.value)} className="ml-2 w-24 rounded-lg border border-slate-300 px-3 py-2" /></label>}
        {isCustomText && <label className="block text-sm font-medium">Your text<textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={2000} className="mt-1 w-full rounded-lg border border-slate-300 p-3" placeholder="Paste or write the text you want to practice. Plain characters only." /></label>}
      </div>
      {formErr && <p role="alert" className="mt-2 text-red-600">{formErr}</p>}
      <button onClick={go} className="mt-5 min-h-12 rounded-xl bg-ember px-6 font-bold text-white">Start</button>
    </main>);
}

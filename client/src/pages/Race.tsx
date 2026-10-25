import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seg from '../components/Seg';
import TextView from '../components/TextView';
import { api } from '../services/api';
interface Info { id: string; text: string; startsAt: number; serverNow: number; difficulty: string; playerCar: string; ai: { name: string; car: string; wpm: number }[] }
interface Row { name: string; car: string; you: boolean; finishSec: number | null; wpm: number }
interface Result { place: number; total: number; finished: boolean; seconds: number; progress: number; wpm: number; accuracy: number; errors: number; flagged: boolean; xp: number; achievements: { id: string; title: string; icon: string }[]; standings: Row[] }
const RANGE: Record<string, string> = { easy: '25–40', medium: '40–60', hard: '60–80', expert: '80–110' };
const ord = (n: number) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const MAX_CPS = 45; // visual speed cap: no car can move faster than ~540 WPM

function Racing({ info, onDone, onErr }: { info: Info; onDone: (r: Result) => void; onErr: (e: string) => void }) {
  const off = useRef(info.serverNow - Date.now()); const now = () => Date.now() + off.current;
  const text = info.text, len = text.length, total = info.ai.length + 1;
  const [typed, setTyped] = useState(''); const [ms, setMs] = useState(info.startsAt - now()); const [rank, setRank] = useState(total); const [live, setLive] = useState({ wpm: 0, acc: 100 });
  const st = useRef({ typed: '', ks: 0, bad: 0, done: false, per: [] as number[], last: 0 });
  const cars = useRef<(HTMLSpanElement | null)[]>([]); const shown = useRef<number[]>(Array(total).fill(0)); const target = useRef(0); const input = useRef<HTMLInputElement>(null);
  const prefix = (t: string) => { let i = 0; while (i < t.length && i < len && t[i] === text[i]) i++; return i; };
  async function finish() {
    const s = st.current; if (s.done) return; s.done = true;
    const seconds = Math.min(180, Math.max(1, (now() - info.startsAt) / 1000));
    try { onDone(await api<Result>(`/races/${info.id}/finish`, { typed: s.typed, seconds, keystrokes: s.ks, wrong: s.bad, perSecond: s.per })); } catch (e) { onErr((e as Error).message); }
  }
  useEffect(() => {
    input.current?.focus(); let raf = 0, last = performance.now();
    const frame = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000); last = t; const el = Math.max(0, (now() - info.startsAt) / 1000), sh = shown.current;
      info.ai.forEach((a, i) => { sh[i + 1] = Math.min(1, ((a.wpm * 5) / 60) * el / len); });
      const d = target.current - sh[0]; sh[0] += Math.sign(d) * Math.min(Math.abs(d) * (1 - Math.exp(-dt * 9)), (MAX_CPS / len) * dt);
      sh.forEach((p, i) => { const c = cars.current[i]; if (c) c.style.left = `calc((100% - 34px) * ${p})`; });
      if (!st.current.done) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const a = setInterval(() => { setMs(info.startsAt - now()); const el = (now() - info.startsAt) / 1000, sh = shown.current; setRank(1 + info.ai.filter((x, i) => sh[i + 1] > target.current + 1e-9 || (x.wpm * 5 / 60) * Math.max(0, el) / len >= 1).length);
      const s = st.current; if (el >= 2) setLive({ wpm: Math.round(prefix(s.typed) / 5 / (el / 60)), acc: s.ks ? Math.round(((s.ks - s.bad) / s.ks) * 100) : 100 }); }, 200);
    const b = setInterval(() => { const s = st.current; if (now() < info.startsAt || s.done) return; s.per.push(s.typed.length - s.last); s.last = s.typed.length; if ((now() - info.startsAt) / 1000 >= 180) finish(); }, 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(a); clearInterval(b); st.current.done = true; };
  }, []);
  function press(c: string) {
    const s = st.current; if (s.done || now() < info.startsAt || s.typed.length >= len) return;
    s.ks++; if (c !== text[s.typed.length]) s.bad++; s.typed += c; setTyped(s.typed); target.current = prefix(s.typed) / len;
    if (s.typed === text) finish();
  }
  function back() { const s = st.current; if (s.done || !s.typed.length) return; s.typed = s.typed.slice(0, -1); setTyped(s.typed); target.current = prefix(s.typed) / len; }
  const label = ms > 3000 ? 'Get ready…' : ms > 0 ? String(Math.ceil(ms / 1000)) : ms > -900 ? 'GO!' : '';
  const racers = [{ name: 'You', car: info.playerCar, you: true }, ...info.ai.map(a => ({ name: a.name, car: a.car, you: false }))];
  return (
    <main className="mx-auto max-w-3xl p-4" onClick={() => input.current?.focus()}>
      <div className="flex items-end justify-between gap-4"><div><span className="text-sm text-slate-500">Position</span><b className="block text-3xl tabular-nums" aria-live="polite">{ord(rank)} <span className="text-lg font-semibold text-slate-500">of {total}</span></b></div>
        <div className="flex gap-6 text-right"><div><b className="block text-2xl tabular-nums">{live.wpm}</b><span className="text-sm text-slate-500">WPM</span></div><div><b className="block text-2xl tabular-nums">{live.acc}%</b><span className="text-sm text-slate-500">accuracy</span></div></div></div>
      <div className="relative mt-3 overflow-hidden rounded-xl bg-slate-800 p-2" role="img" aria-label="Race track">
        {racers.map((r, i) => (
          <div key={i} className={'flex items-center border-b border-dashed border-slate-500/50 last:border-0 ' + (r.you ? 'bg-slate-700/60' : '')}>
            <span className="w-14 shrink-0 truncate px-1 text-xs font-semibold text-slate-300 sm:w-20">{r.name}</span>
            <div className="relative h-11 flex-1 pr-3"><span ref={el => { cars.current[i] = el; }} className="absolute top-1/2 -translate-y-1/2 text-[26px] leading-none will-change-[left]" style={{ left: 0 }}><span className="inline-block" style={{ transform: 'scaleX(-1)' }}>{r.car}</span></span></div>
          </div>))}
        <div className="absolute bottom-0 right-2 top-0 w-3" style={{ background: 'repeating-conic-gradient(#fff 0% 25%, #111 0% 50%) 50% / 12px 12px' }} aria-hidden />
        {label && <div className="absolute inset-0 grid place-items-center bg-black/40 text-4xl font-extrabold text-white" aria-live="assertive">{label}</div>}
      </div>
      <div className="mt-3"><TextView text={text} typed={typed} /></div>
     
<input
  ref={input}
  aria-label="Typing input"
  autoCapitalize="off"
  autoComplete="off"
  autoCorrect="off"
  spellCheck={false}
  value={typed}
  className="fixed left-0 top-0 h-px w-px opacity-0"
  onChange={e => {
    const next = e.target.value;
    if (next.length > typed.length) {
      for (const c of next.slice(typed.length)) {
        press(c);
      }
    } else if (next.length < typed.length) {
      for (let i = typed.length; i > next.length; i--) {
        back();
      }
    }
  }}
  onKeyDown={e => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      back();
    }
  }}
/>

      <p className="mt-2 text-sm text-slate-500">A wrong letter stops your car until you fix it with Backspace.</p>
    </main>);
}
export default function Race() {
  useEffect(() => { document.title = 'Online Typing Race vs AI | TypeForge'; }, []);
  const [diff, setDiff] = useState('easy'); const [opp, setOpp] = useState('3'); const [info, setInfo] = useState<Info | null>(null); const [res, setRes] = useState<Result | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState<{ races: number; wins: number; recent: { difficulty: string; place: number; total: number; wpm: number }[] } | null>(null);
  useEffect(() => { if (!info) api<typeof hist>('/races/recent').then(setHist).catch(() => undefined); }, [info]);
  async function start() { setErr(''); setBusy(true); setRes(null); try { setInfo(await api<Info>('/races', { difficulty: diff, opponents: Number(opp) })); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } }
  if (info && !res) return <Racing key={info.id} info={info} onDone={setRes} onErr={e => { setErr(e); setInfo(null); }} />;
  if (info && res) return (
    <main className="mx-auto max-w-3xl p-4"><section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-3xl font-extrabold">{res.finished ? (res.place === 1 ? 'You won!' : `You finished ${ord(res.place)}`) : `Time's up · ${ord(res.place)}`}</h1>
      {!res.finished && <p className="text-slate-600">You reached {res.progress}% of the track. Finish the full text to earn rewards.</p>}
      {res.flagged && <p className="mt-1 text-amber-700">This result was flagged for review and earned no rewards.</p>}
      <ol className="mt-4 space-y-1">{res.standings.map((r, i) => <li key={i} className={'flex items-center justify-between rounded-lg px-3 py-2 ' + (r.you ? 'bg-orange-50 font-bold' : 'bg-slate-50')}><span>{i + 1}. <span className="text-xl">{r.car}</span> {r.name}</span><span className="text-sm text-slate-600">{r.finishSec ? r.finishSec.toFixed(1) + 's' : 'did not finish'} · {Math.round(r.wpm)} WPM</span></li>)}</ol>
      <div className="my-4 grid grid-cols-3 gap-4">{[[Math.round(res.wpm), 'WPM'], [Math.round(res.accuracy) + '%', 'accuracy'], [res.errors, 'errors']].map(([v, l]) => <div key={l as string} className="border-l-4 border-slate-200 pl-3"><b className="block text-2xl">{v}</b><span className="text-sm text-slate-500">{l}</span></div>)}</div>
      {res.xp > 0 && <p className="font-semibold text-green-700">+{res.xp} XP</p>}
      {res.achievements.map(a => <p key={a.id} className="font-bold text-green-700">{a.icon} Achievement unlocked: {a.title}</p>)}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={start} disabled={busy} className="min-h-11 rounded-lg bg-ember px-5 font-bold text-white disabled:opacity-60">Race again</button><button onClick={() => { setInfo(null); setRes(null); }} className="min-h-11 rounded-lg border border-slate-300 px-5">Change settings</button></div>
    </section></main>);
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-extrabold">Typing race</h1>
      <p className="mt-1 text-slate-600">Type the text faster than the computer cars. Your car moves with every correct letter, so speed and accuracy both decide the finish.</p>
      <div className="mt-4 space-y-3"><Seg label="AI difficulty" v={['easy', 'medium', 'hard', 'expert']} cur={diff} set={setDiff} /><p className="text-sm text-slate-500">Opponents type at about {RANGE[diff]} WPM.</p><Seg label="Opponents" v={['1', '2', '3']} cur={opp} set={setOpp} /></div>
      {err && <p role="alert" className="mt-3 text-red-600">{err}</p>}
      <button onClick={start} disabled={busy} className="mt-5 min-h-12 rounded-xl bg-ember px-6 font-bold text-white disabled:opacity-60">{busy ? 'Setting up…' : 'Start race'}</button>
      {hist && hist.recent.length > 0 && <section className="mt-6"><h2 className="font-bold">Your races · {hist.wins} wins from {hist.races}</h2><ul className="mt-2 space-y-1 text-sm">{hist.recent.map((r, i) => <li key={i} className="flex justify-between rounded-lg bg-white px-3 py-2 border border-slate-200"><span className="capitalize">{r.difficulty}</span><span>{ord(r.place)} of {r.total} · {Math.round(r.wpm)} WPM</span></li>)}</ul></section>}
      <p className="mt-6 text-sm text-slate-500">Racing against real players arrives in the next phase. <Link to="/test" className="underline">Warm up with a typing test</Link>.</p>
    </main>);
}

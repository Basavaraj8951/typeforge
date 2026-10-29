import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TextView from '../components/TextView';
import { useRoom, type EndInfo, type GameInfo, type Kind, type RoomState, type TickPlayer } from '../hooks/useRoom';
import { useAuth } from '../store/auth';
const ord = (n: number) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const CARS = ['🚗', '🚙', '🚕', '🏎️'];
const prefix = (text: string, t: string) => { let i = 0; while (i < t.length && t[i] === text[i]) i++; return i; };

function useTyping(game: GameInfo, send: (k: string) => void) {
  const [typed, setTyped] = useState(''); const ref = useRef(''); const input = useRef<HTMLInputElement>(null);
  const [ms, setMs] = useState(game.startsAt - (Date.now() + game.offset));
  useEffect(() => { input.current?.focus(); const i = setInterval(() => setMs(game.startsAt - (Date.now() + game.offset)), 100); return () => clearInterval(i); }, [game]);
  const press = (c: string) => { if (ms > 0 || ref.current.length >= game.text.length || c.length !== 1) return; ref.current += c; setTyped(ref.current); send(c); };
  const back = () => { if (ms > 0 || !ref.current) return; ref.current = ref.current.slice(0, -1); setTyped(ref.current); send('\b'); };
  const label = ms > 3000 ? 'Get ready…' : ms > 0 ? String(Math.ceil(ms / 1000)) : ms > -900 ? 'GO!' : '';
  const field = <input ref={input} aria-label="Typing input" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} value="" className="fixed left-0 top-0 h-px w-px opacity-0" onChange={e => { for (const c of e.target.value) press(c); }} onKeyDown={e => { if (e.key === 'Backspace') back(); }} />;
  return { typed, label, field, refocus: () => input.current?.focus() };
}
function Menu({ h, type }: { h: ReturnType<typeof useRoom>; type: Kind }) {
  const [code, setCode] = useState('');
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-extrabold">{type === 'race' ? 'Race real players' : 'Typing battle'}</h1>
      <p className="mt-1 text-slate-600">{type === 'race' ? 'Everyone gets the same text. First to finish wins. Up to 4 players in a private room.' : 'Two players, same text. Correct letters build combos and drain your opponent’s HP (game points). Mistakes break your combo.'}</p>
      <p className="mt-2 text-sm" role="status"><span className={'mr-1 inline-block h-2 w-2 rounded-full ' + (h.online ? 'bg-green-500' : 'bg-slate-400')} />{h.online ? 'Connected' : 'Connecting…'}</p>
      {h.err && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-red-700">{h.err}</p>}
      {h.queued ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-center" role="status"><p className="font-bold">Finding an opponent…</p><p className="mt-1 text-sm text-slate-500">You will start automatically when someone joins.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2"><button onClick={h.cancelQuick} className="min-h-11 rounded-lg border border-slate-300 px-5">Cancel</button>{type === 'race' && <Link to="/race" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">Race the computer instead</Link>}</div></div>
      ) : (
        <div className="mt-4 space-y-3">
          <button disabled={!h.online} onClick={h.quick} className="min-h-12 w-full rounded-xl bg-ember px-6 font-bold text-white disabled:opacity-60">Quick match</button>
          <button disabled={!h.online} onClick={h.create} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-6 font-semibold disabled:opacity-60">Create private room</button>
          <form onSubmit={e => { e.preventDefault(); h.join(code); }} className="flex gap-2"><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={7} placeholder="TF-8K29" aria-label="Room code" className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 font-mono uppercase" /><button disabled={!h.online || code.length < 7} className="min-h-12 rounded-xl bg-slate-900 px-5 font-bold text-white disabled:opacity-50">Join</button></form>
          {type === 'race' && <p className="text-sm text-slate-500">Prefer a quiet warm-up? <Link to="/race" className="underline">Race the computer</Link>.</p>}
        </div>)}
    </main>);
}
function Lobby({ h, room, me }: { h: ReturnType<typeof useRoom>; room: RoomState; me?: string }) {
  const [copied, setCopied] = useState(false); const host = room.hostId === me;
  return (
    <main className="mx-auto max-w-xl p-4"><h1 className="text-2xl font-extrabold">Lobby</h1>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 text-center"><p className="text-sm text-slate-500">Share this code with friends</p><p className="my-1 font-mono text-4xl font-extrabold tracking-wider" aria-label={'Room code ' + room.code}>{room.code}</p>
        <button onClick={async () => { try { await navigator.clipboard.writeText(room.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ } }} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm">{copied ? 'Copied' : 'Copy code'}</button></div>
      <ul className="mt-4 space-y-1">{room.players.map(p => <li key={p.id} className="flex justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"><span>{p.name}{p.id === me && ' (you)'}</span><span className="text-sm text-slate-500">{p.id === room.hostId ? 'Host' : p.connected ? 'Ready' : 'Reconnecting…'}</span></li>)}</ul>
      <p className="mt-2 text-sm text-slate-500">{room.players.length} of {room.max} players</p>
      {h.err && <p role="alert" className="mt-2 text-red-600">{h.err}</p>}
      <div className="mt-4 flex flex-wrap gap-2">{host ? <button onClick={h.start} disabled={room.players.length < 2} className="min-h-12 rounded-xl bg-ember px-6 font-bold text-white disabled:opacity-50">{room.players.length < 2 ? 'Waiting for players…' : 'Start'}</button> : <p className="flex min-h-12 items-center text-slate-600" role="status">Waiting for the host to start…</p>}<button onClick={h.leave} className="min-h-12 rounded-xl border border-slate-300 px-6">Leave</button></div>
    </main>);
}
function RaceGame({ h, room, game, me }: { h: ReturnType<typeof useRoom>; room: RoomState; game: GameInfo; me?: string }) {
  const t = useTyping(game, h.key); const len = game.text.length, mine = prefix(game.text, t.typed) / len;
  const prog = (id: string) => (id === me ? mine : h.tick.find(x => x.id === id)?.progress ?? 0);
  const rank = 1 + room.players.filter(p => p.id !== me && prog(p.id) > mine).length;
  const done = t.typed === game.text;
  return (
    <main className="mx-auto max-w-3xl p-4" onClick={t.refocus}>
      <div><span className="text-sm text-slate-500">Position</span><b className="block text-3xl tabular-nums" aria-live="polite">{ord(rank)} <span className="text-lg font-semibold text-slate-500">of {room.players.length}</span></b></div>
      <div className="relative mt-3 overflow-hidden rounded-xl bg-slate-800 p-2" role="img" aria-label="Race track">
        {room.players.map((p, i) => <div key={p.id} className={'flex items-center border-b border-dashed border-slate-500/50 last:border-0 ' + (p.id === me ? 'bg-slate-700/60' : '')}>
          <span className={'w-14 shrink-0 truncate px-1 text-xs font-semibold sm:w-20 ' + (p.connected ? 'text-slate-300' : 'text-slate-500 line-through')}>{p.id === me ? 'You' : p.name}</span>
          <div className="relative h-11 flex-1 pr-3"><span className="absolute top-1/2 -translate-y-1/2 text-[26px] leading-none transition-[left] duration-300 ease-linear" style={{ left: `calc((100% - 34px) * ${prog(p.id)})` }}><span className="inline-block" style={{ transform: 'scaleX(-1)' }}>{CARS[i % 4]}</span></span></div></div>)}
        <div className="absolute bottom-0 right-2 top-0 w-3" style={{ background: 'repeating-conic-gradient(#fff 0% 25%, #111 0% 50%) 50% / 12px 12px' }} aria-hidden />
        {t.label && <div className="absolute inset-0 grid place-items-center bg-black/40 text-4xl font-extrabold text-white" aria-live="assertive">{t.label}</div>}
      </div>
      <div className="mt-3"><TextView text={game.text} typed={t.typed} /></div>{t.field}
      <p className="mt-2 text-sm text-slate-500" role="status">{done ? 'You finished! Waiting for the final results…' : 'A wrong letter stops your car until you fix it with Backspace. Results are decided by the server.'}</p>
    </main>);
}
function Bar({ v, color, label }: { v: number; color: string; label: string }) {
  return <div className="h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}><div className="h-full transition-[width] duration-200" style={{ width: Math.max(0, Math.min(100, v)) + '%', background: color }} /></div>;
}
function Fighter({ name, p, you }: { name: string; p?: TickPlayer; you?: boolean }) {
  return (
    <div className={'rounded-xl border bg-white p-3 ' + (you ? 'border-ember' : 'border-slate-200')}>
      <div className="flex items-baseline justify-between"><b className="truncate">{you ? 'You' : name}</b><span className="text-sm tabular-nums text-slate-600">HP {Math.round(p?.hp ?? 100)}</span></div>
      <div className="mt-1"><Bar v={p?.hp ?? 100} color="#2f9e44" label={name + ' HP'} /></div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>Power</span><span>Combo <b className="text-base text-ember">×{p?.combo ?? 1}</b></span></div>
      <div className="mt-1"><Bar v={p?.power ?? 0} color="#e8590c" label={name + ' power'} /></div>
      <p key={p?.attack?.n} className="k-hit mt-2 min-h-5 text-sm font-semibold text-slate-700">{p?.attack ? p.attack.name : ''}</p>
    </div>);
}
function BattleGame({ h, room, game, me }: { h: ReturnType<typeof useRoom>; room: RoomState; game: GameInfo; me?: string }) {
  const t = useTyping(game, h.key); const foe = room.players.find(p => p.id !== me); const get = (id?: string) => h.tick.find(x => x.id === id);
  return (
    <main className="mx-auto max-w-3xl p-4" onClick={t.refocus}>
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-2"><Fighter name="You" p={get(me)} you /><div className="pt-8 text-xl font-extrabold text-slate-400" aria-hidden>VS</div><Fighter name={foe?.name ?? 'Opponent'} p={get(foe?.id)} />
        {t.label && <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/40 text-4xl font-extrabold text-white" aria-live="assertive">{t.label}</div>}</div>
      <div className="mt-3"><TextView text={game.text} typed={t.typed} /></div>{t.field}
      <p className="mt-2 text-sm text-slate-500">Keep a clean streak to raise your combo. A mistake breaks it and cuts your power. First to drain the other player’s HP wins. It’s a game, so no one gets hurt.</p>
    </main>);
}
function End({ h, end, me, type }: { h: ReturnType<typeof useRoom>; end: EndInfo; me?: string; type: Kind }) {
  const mine = end.results.find(r => r.id === me); const won = type === 'race' ? mine?.place === 1 : mine?.won;
  const why: Record<string, string> = { forfeit: 'Your opponent left the match.', time: 'Time ran out.', hp: 'HP reached zero.', text: 'The text was completed.', finished: 'Everyone finished.' };
  return (
    <main className="mx-auto max-w-2xl p-4"><section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-3xl font-extrabold">{won ? 'You won!' : type === 'race' ? `You finished ${ord(mine?.place ?? 0)}` : 'You lost this one'}</h1><p className="text-slate-600">{why[end.reason] ?? ''}</p>
      <ol className="mt-4 space-y-1">{end.results.map(r => <li key={r.id} className={'flex items-center justify-between rounded-lg px-3 py-2 ' + (r.id === me ? 'bg-orange-50 font-bold' : 'bg-slate-50')}><span>{r.place}. {r.id === me ? 'You' : r.name}</span><span className="text-sm text-slate-600">{Math.round(r.wpm)} WPM · {Math.round(r.accuracy)}% acc{type === 'race' ? (r.finishSec ? ` · ${r.finishSec.toFixed(1)}s` : ` · ${r.progress}%`) : ` · HP ${r.hp} · best combo ×${r.maxCombo}`}</span></li>)}</ol>
      {end.me.xp > 0 ? <p className="mt-3 font-semibold text-green-700">+{end.me.xp} XP</p> : <p className="mt-3 text-sm text-slate-500">No XP this time: rewards need a finished race or a battle lasting at least 15 seconds, and are capped per day.</p>}
      {end.me.achievements.map(a => <p key={a.id} className="font-bold text-green-700">{a.icon} Achievement unlocked: {a.title}</p>)}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={h.reset} className="min-h-11 rounded-lg bg-ember px-5 font-bold text-white">Play again</button><Link to="/dashboard" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5">Dashboard</Link></div>
    </section></main>);
}
export default function Live({ type }: { type: Kind }) {
  const h = useRoom(type); const me = useAuth(s => s.user?.id); const { room, game, end } = h;
  useEffect(() => { document.title = type === 'race' ? 'Online Typing Race with Friends | TypeForge' : 'Typing Battle | TypeForge'; }, [type]);
  const Game = useMemo(() => (type === 'race' ? RaceGame : BattleGame), [type]);
  if (end) return <End h={h} end={end} me={me} type={type} />;
  if (room && game && room.status !== 'lobby') return <Game h={h} room={room} game={game} me={me} key={game.startsAt} />;
  if (room && room.status === 'lobby') return <Lobby h={h} room={room} me={me} />;
  return <Menu h={h} type={type} />;
}

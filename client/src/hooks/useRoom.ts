import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../services/socket';
export type Kind = 'race' | 'battle';
export interface RoomState { code: string; type: Kind; status: 'lobby' | 'countdown' | 'live' | 'finished'; hostId: string; max: number; players: { id: string; name: string; connected: boolean }[] }
export interface GameInfo { text: string; startsAt: number; offset: number }
export interface TickPlayer { id: string; progress: number; finished?: boolean; finishSec?: number | null; wpm?: number; hp?: number; power?: number; combo?: number; streak?: number; attack?: { name: string; dmg: number; n: number } | null }
export interface EndInfo { reason: string; results: { id: string; name: string; place: number; won?: boolean; finished?: boolean; wpm: number; accuracy: number; progress: number; finishSec?: number | null; hp?: number; mistakes?: number; maxCombo?: number }[]; me: { xp: number; achievements: { id: string; title: string; icon: string }[] } }
const ack = (ev: string, p?: unknown) => new Promise<{ ok: boolean; error?: string }>(res => { socket().timeout(5000).emit(ev, p, (err: Error | null, r: { ok: boolean; error?: string }) => res(err ? { ok: false, error: 'The server did not respond. Try again.' } : r)); });
export function useRoom(type: Kind) {
  const [room, setRoom] = useState<RoomState | null>(null); const [game, setGame] = useState<GameInfo | null>(null); const [tick, setTick] = useState<TickPlayer[]>([]);
  const [end, setEnd] = useState<EndInfo | null>(null); const [queued, setQueued] = useState(false); const [err, setErr] = useState(''); const [online, setOnline] = useState(false);
  const inRoom = useRef(false); inRoom.current = !!room && room.status !== 'finished';
  useEffect(() => {
    const s = socket();
    const h: Record<string, (...a: any[]) => void> = {
      connect: () => { setOnline(true); setErr(''); }, disconnect: () => setOnline(false), connect_error: () => { setOnline(false); setErr('Cannot reach the game server. Check your connection.'); },
      'room:state': (r: RoomState) => { if (r.type !== type) { s.emit('room:leave'); return; } setRoom(r); setQueued(false); if (r.status === 'lobby') { setGame(null); setEnd(null); setTick([]); } },
      'game:start': (g: { text: string; startsAt: number; serverNow: number; type: Kind }) => { if (g.type !== type) return; setGame({ text: g.text, startsAt: g.startsAt, offset: g.serverNow - Date.now() }); setEnd(null); setTick([]); },
      'game:tick': (t: { players: TickPlayer[] }) => setTick(t.players),
      'game:end': (e: EndInfo) => setEnd(e),
      'room:cancelled': (c: { reason: string }) => { setRoom(null); setGame(null); setTick([]); setErr(c.reason); },
    };
    for (const [e, f] of Object.entries(h)) s.on(e, f);
    if (s.connected) setOnline(true); else s.connect();
    return () => { if (inRoom.current) s.emit('room:leave'); s.emit('room:quick:cancel'); for (const [e, f] of Object.entries(h)) s.off(e, f); };
  }, [type]);
  const reset = useCallback(() => { setRoom(null); setGame(null); setEnd(null); setTick([]); setQueued(false); }, []);
  const run = async (ev: string, p?: unknown, after?: () => void) => { setErr(''); const r = await ack(ev, p); if (!r.ok) setErr(r.error || 'Something went wrong.'); else after?.(); };
  return {
    room, game, tick, end, queued, err, online, reset, setErr,
    create: () => run('room:create', { type }), join: (code: string) => run('room:join', { code }), start: () => run('room:start'),
    quick: () => run('room:quick', { type }, () => setQueued(true)),
    cancelQuick: () => { socket().emit('room:quick:cancel'); setQueued(false); },
    leave: () => { socket().emit('room:leave'); reset(); },
    key: (k: string) => socket().emit('game:key', k),
  };
}

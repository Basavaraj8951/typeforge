import type { Server } from 'socket.io';
import { battleText, raceText } from '../config/race.js';
import { BattleEngine } from '../services/battleEngine.js';
import { RaceEngine } from '../services/raceEngine.js';
import { settleMatch } from '../services/matchRewards.js';

export type RoomType = 'race' | 'battle';
const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const makeCode = () => 'TF-' + Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('');
export const CODE_RE = new RegExp(`^TF-[${A}]{4}$`);
interface Member { id: string; name: string; connected: boolean; lastSeen: number; left: boolean }
interface Room { code: string; type: RoomType; quick: boolean; max: number; status: 'lobby' | 'countdown' | 'live' | 'finished'; hostId: string; members: Map<string, Member>; text: string; startsAt: number; engine: RaceEngine | BattleEngine | null; tick?: NodeJS.Timeout; go?: NodeJS.Timeout; cap?: NodeJS.Timeout }
type Res = { ok: true; [k: string]: unknown } | { ok: false; error: string };
const GRACE = { race: 30000, battle: 10000 };
const COUNTDOWN_MS = 5000, RACE_MAX_MS = 150000, BATTLE_MAX_MS = 180000, RACE_TAIL_SEC = 20;

/** In-memory rooms (single server instance; add the Socket.IO Redis adapter to scale out). The server owns all timing and results. */
export class Manager {
  rooms = new Map<string, Room>(); byUser = new Map<string, string>(); queue: Record<RoomType, { id: string; name: string }[]> = { race: [], battle: [] };
  constructor(private io: Server) {}
  private to(r: Room, ev: string, p: unknown) { this.io.to('room:' + r.code).emit(ev, p); }
  private pub(r: Room) { return { code: r.code, type: r.type, status: r.status, hostId: r.hostId, max: r.max, players: [...r.members.values()].map(m => ({ id: m.id, name: m.name, connected: m.connected })) }; }
  private push(r: Room) { this.to(r, 'room:state', this.pub(r)); }
  private attach(id: string, code: string) { this.byUser.set(id, code); this.io.in('user:' + id).socketsJoin('room:' + code); }
  private detach(id: string, code: string) { this.byUser.delete(id); this.io.in('user:' + id).socketsLeave('room:' + code); }
  private roomOf(id: string) { const c = this.byUser.get(id); return c ? this.rooms.get(c) : undefined; }
  private member(id: string, name: string): Member { return { id, name, connected: true, lastSeen: Date.now(), left: false }; }
  private newRoom(type: RoomType, host: { id: string; name: string }, quick: boolean) {
    let code: string; do code = makeCode(); while (this.rooms.has(code));
    const r: Room = { code, type, quick, max: type === 'battle' || quick ? 2 : 4, status: 'lobby', hostId: host.id, members: new Map([[host.id, this.member(host.id, host.name)]]), text: '', startsAt: 0, engine: null };
    this.rooms.set(code, r); this.attach(host.id, code); return r;
  }
  create(id: string, name: string, type: RoomType): Res {
    if (this.roomOf(id)) return { ok: false, error: 'You are already in a room. Leave it first.' };
    const r = this.newRoom(type, { id, name }, false); this.push(r); return { ok: true, code: r.code };
  }
  join(id: string, name: string, raw: string): Res {
    const code = String(raw ?? '').trim().toUpperCase(); if (!CODE_RE.test(code)) return { ok: false, error: 'Room codes look like TF-8K29.' };
    if (this.roomOf(id)) return { ok: false, error: 'You are already in a room. Leave it first.' };
    const r = this.rooms.get(code); if (!r) return { ok: false, error: 'Room not found. Check the code.' };
    if (r.status !== 'lobby') return { ok: false, error: 'That match has already started.' };
    if (r.members.size >= r.max) return { ok: false, error: 'That room is full.' };
    r.members.set(id, this.member(id, name)); this.attach(id, code); this.push(r); return { ok: true, code };
  }
  quick(id: string, name: string, type: RoomType): Res {
    if (this.roomOf(id)) return { ok: false, error: 'You are already in a room. Leave it first.' };
    this.cancelQuick(id); const other = this.queue[type].shift();
    if (!other) { this.queue[type].push({ id, name }); return { ok: true, queued: true }; }
    const r = this.newRoom(type, other, true); r.members.set(id, this.member(id, name)); this.attach(id, r.code); this.startRoom(r); return { ok: true, matched: true };
  }
  cancelQuick(id: string) { for (const t of ['race', 'battle'] as RoomType[]) this.queue[t] = this.queue[t].filter(q => q.id !== id); }
  start(id: string): Res {
    const r = this.roomOf(id); if (!r) return { ok: false, error: 'You are not in a room.' };
    if (r.hostId !== id) return { ok: false, error: 'Only the host can start.' };
    if (r.status !== 'lobby') return { ok: false, error: 'Already started.' };
    if (r.members.size < 2) return { ok: false, error: 'Wait for at least one more player.' };
    this.startRoom(r); return { ok: true };
  }
  private startRoom(r: Room) {
    r.status = 'countdown'; r.text = r.type === 'race' ? raceText('medium') : battleText(); r.startsAt = Date.now() + COUNTDOWN_MS;
    const ps = [...r.members.values()].map(m => ({ id: m.id, name: m.name }));
    r.engine = r.type === 'race' ? new RaceEngine(r.text, ps) : new BattleEngine(r.text, ps);
    this.to(r, 'game:start', { type: r.type, text: r.text, startsAt: r.startsAt, serverNow: Date.now() }); this.push(r);
    r.go = setTimeout(() => this.goLive(r), COUNTDOWN_MS);
  }
  private goLive(r: Room) {
    if (r.status !== 'countdown') return; r.status = 'live'; this.push(r);
    r.tick = setInterval(() => this.tickRoom(r), 200); r.cap = setTimeout(() => this.finish(r, 'time'), r.type === 'race' ? RACE_MAX_MS : BATTLE_MAX_MS);
  }
  private t(r: Room) { return (Date.now() - r.startsAt) / 1000; }
  key(id: string, k: string) {
    const r = this.roomOf(id); if (!r || !r.engine || (r.status !== 'live' && r.status !== 'countdown')) return;
    r.engine.key(id, k, this.t(r)); if (r.status === 'live') this.checkEnd(r);
  }
  private checkEnd(r: Room) {
    if (r.status !== 'live' || !r.engine) return; const t = this.t(r);
    if (r.engine instanceof BattleEngine) { if (r.engine.winner) this.finish(r, r.engine.reason ?? 'hp'); }
    else if (r.engine.done || (r.engine.firstFinish !== null && t - r.engine.firstFinish > RACE_TAIL_SEC)) this.finish(r, r.engine.done ? 'finished' : 'time');
  }
  private tickRoom(r: Room) {
    if (r.status !== 'live' || !r.engine) return; const t = this.t(r), now = Date.now();
    for (const m of r.members.values()) if (!m.connected && !m.left && now - m.lastSeen > GRACE[r.type]) { m.left = true; this.dropFromGame(r, m.id); }
    if (r.status !== 'live') return;
    this.to(r, 'game:tick', { t, players: r.engine instanceof BattleEngine ? r.engine.snapshot() : r.engine.snapshot(t) }); this.checkEnd(r);
  }
  private dropFromGame(r: Room, id: string) { if (!r.engine) return; const t = this.t(r); if (r.engine instanceof BattleEngine) r.engine.forfeit(id, t); else r.engine.leave(id); this.checkEnd(r); }
  private clear(r: Room) { clearInterval(r.tick); clearTimeout(r.go); clearTimeout(r.cap); }
  private cancel(r: Room, reason: string) { this.clear(r); this.to(r, 'room:cancelled', { reason }); for (const m of r.members.values()) this.detach(m.id, r.code); this.rooms.delete(r.code); }
  private finish(r: Room, reason: string) {
    if ((r.status !== 'live' && r.status !== 'countdown') || !r.engine) return; this.clear(r); const t = Math.max(0, this.t(r)); r.status = 'finished';
    if (r.engine instanceof BattleEngine && !r.engine.winner) r.engine.timeout(t);
    const rows = r.engine.results(t) as any[]; const why = r.engine instanceof BattleEngine ? r.engine.reason ?? reason : reason;
    this.push(r); const members = [...r.members.values()];
    settleMatch({ type: r.type, code: r.code, quick: r.quick, text: r.text }, rows, t, why).catch(e => { console.error('settle failed', e); return new Map(); })
      .then(rw => { for (const m of members) this.io.to('user:' + m.id).emit('game:end', { reason: why, results: rows, me: rw.get(m.id) ?? { xp: 0, achievements: [] } }); });
    for (const m of members) this.detach(m.id, r.code); setTimeout(() => this.rooms.delete(r.code), 60000).unref();
  }
  leave(id: string) {
    this.cancelQuick(id); const r = this.roomOf(id); if (!r) return; const m = r.members.get(id);
    if (r.status === 'lobby') { r.members.delete(id); this.detach(id, r.code); if (!r.members.size) { this.rooms.delete(r.code); return; } if (r.hostId === id) r.hostId = [...r.members.keys()][0]; this.push(r); }
    else if (r.status === 'countdown') this.cancel(r, 'A player left before the start.');
    else if (r.status === 'live' && m) { m.left = true; this.detach(id, r.code); this.dropFromGame(r, id); }
  }
  /** Called when a user's last socket closes. */
  dropped(id: string) {
    this.cancelQuick(id); const r = this.roomOf(id); if (!r) return; const m = r.members.get(id); if (!m) return;
    m.connected = false; m.lastSeen = Date.now();
    if (r.status === 'lobby') this.leave(id);
    else if (r.status === 'countdown' && [...r.members.values()].filter(x => x.connected).length < 2) this.cancel(r, 'A player disconnected before the start.');
    else this.push(r);
  }
  /** Called on every new socket: restores state after a reconnect. */
  reconnect(id: string) {
    const r = this.roomOf(id); if (!r) return; const m = r.members.get(id); if (!m || m.left) return; m.connected = true;
    this.io.in('user:' + id).socketsJoin('room:' + r.code); this.push(r);
    if (r.status === 'countdown' || r.status === 'live') this.io.to('user:' + id).emit('game:start', { type: r.type, text: r.text, startsAt: r.startsAt, serverNow: Date.now() });
  }
}

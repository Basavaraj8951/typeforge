import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Manager, type RoomType } from './manager.js';

const reply = (ack: unknown, v: object) => { if (typeof ack === 'function') ack(v); };
const type = (p: any): RoomType | null => (p?.type === 'race' || p?.type === 'battle' ? p.type : null);
export function attachSockets(http: HttpServer) {
  const io = new Server(http, { cors: { origin: env.client, credentials: true } }); const mgr = new Manager(io);
  io.use(async (socket, next) => {
    try {
      const cookies = Object.fromEntries((socket.handshake.headers.cookie ?? '').split(';').map(x => x.trim().split('=')).filter(x => x[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
      const { sub } = jwt.verify(cookies.tf_token, env.jwt) as { sub: string };
      const u = await User.findById(sub).select('username'); if (!u) return next(new Error('auth'));
      socket.data.userId = String(u._id); socket.data.name = u.username; next();
    } catch { next(new Error('auth')); }
  });
  io.on('connection', socket => {
    const id: string = socket.data.userId, name: string = socket.data.name; socket.join('user:' + id); mgr.reconnect(id);
    let tokens = 60, last = Date.now(); // key-event rate limit: 60 burst, 60/s refill
    socket.on('game:key', (k: unknown) => { const n = Date.now(); tokens = Math.min(60, tokens + ((n - last) / 1000) * 60); last = n; if (tokens < 1 || typeof k !== 'string') return; tokens--; mgr.key(id, k); });
    socket.on('room:create', (p, ack) => { const t = type(p); reply(ack, t ? mgr.create(id, name, t) : { ok: false, error: 'Invalid mode.' }); });
    socket.on('room:join', (p, ack) => reply(ack, mgr.join(id, name, p?.code)));
    socket.on('room:quick', (p, ack) => { const t = type(p); reply(ack, t ? mgr.quick(id, name, t) : { ok: false, error: 'Invalid mode.' }); });
    socket.on('room:quick:cancel', () => mgr.cancelQuick(id));
    socket.on('room:start', (_p, ack) => reply(ack, mgr.start(id)));
    socket.on('room:leave', () => mgr.leave(id));
    socket.on('disconnect', async () => { if (!(await io.in('user:' + id).fetchSockets()).length) mgr.dropped(id); });
  });
  return io;
}

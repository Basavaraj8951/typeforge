import { io, type Socket } from 'socket.io-client';
let s: Socket | null = null;
/** One shared connection. Auth uses the same httpOnly cookie as the REST API. */
export const socket = () => (s ??= io(import.meta.env.VITE_API_URL || '/', { withCredentials: true, autoConnect: false }));

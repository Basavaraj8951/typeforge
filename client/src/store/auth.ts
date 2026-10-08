import { create } from 'zustand';
import { api } from '../services/api';
export interface User { id: string; name: string; username: string; email: string; role: string; level: string; xp: number }
interface S { user: User | null; ready: boolean; load(): Promise<void>; login(identifier: string, password: string): Promise<void>; register(b: Record<string, string>): Promise<void>; logout(): Promise<void> }
export const useAuth = create<S>(set => ({
  user: null, ready: false,
  async load() { try { set({ user: (await api<{ user: User }>('/auth/me')).user }); } catch { set({ user: null }); } set({ ready: true }); },
  async login(identifier, password) { set({ user: (await api<{ user: User }>('/auth/login', { identifier, password })).user }); },
  async register(b) { set({ user: (await api<{ user: User }>('/auth/register', b)).user }); },
  async logout() { await api('/auth/logout', {}); set({ user: null }); },
}));

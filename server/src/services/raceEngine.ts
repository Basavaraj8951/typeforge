import { Typer, r1 } from './engine.js';
export class RaceEngine {
  typers = new Map<string, Typer>(); names = new Map<string, string>(); finish = new Map<string, number>(); left = new Set<string>(); firstFinish: number | null = null;
  constructor(public text: string, players: { id: string; name: string }[]) { for (const p of players) { this.typers.set(p.id, new Typer(text)); this.names.set(p.id, p.name); } }
  key(id: string, k: string, t: number) {
    const ty = this.typers.get(id); if (!ty || this.finish.has(id) || this.left.has(id)) return;
    if (ty.key(k, t) && ty.complete) { this.finish.set(id, t); if (this.firstFinish === null) this.firstFinish = t; }
  }
  leave(id: string) { if (!this.finish.has(id)) this.left.add(id); }
  get done() { return [...this.typers.keys()].every(id => this.finish.has(id) || this.left.has(id)); }
  private wpm(id: string, t: number) { const ty = this.typers.get(id)!, f = this.finish.get(id); const secs = f ?? t; return secs >= 1 ? r1(((f !== undefined ? this.text.length : ty.prefix) / 5) / (secs / 60)) : 0; }
  snapshot(t: number) { return [...this.typers].map(([id, ty]) => ({ id, progress: ty.prefix / this.text.length, finished: this.finish.has(id), finishSec: this.finish.get(id) ?? null, wpm: this.wpm(id, t) })); }
  results(t: number) {
    const rows = [...this.typers].map(([id, ty]) => ({ id, name: this.names.get(id)!, finished: this.finish.has(id), finishSec: this.finish.get(id) ?? null, prefix: ty.prefix }));
    rows.sort((a, b) => (a.finished && b.finished ? a.finishSec! - b.finishSec! : a.finished ? -1 : b.finished ? 1 : b.prefix - a.prefix || a.id.localeCompare(b.id)));
    return rows.map((r, i) => ({ id: r.id, name: r.name, place: i + 1, finished: r.finished, finishSec: r.finishSec, progress: Math.round((r.prefix / this.text.length) * 100), wpm: this.wpm(r.id, t), accuracy: r1(this.typers.get(r.id)!.accuracy) }));
  }
}

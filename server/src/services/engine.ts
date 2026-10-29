/** Server-side typing state for one player. The server rebuilds what each player typed from single key events. */
export const MAX_CPS = 30; // 360 WPM: anything faster is ignored, not rewarded
export const prefixLen = (text: string, typed: string) => { let i = 0; while (i < typed.length && i < text.length && typed[i] === text[i]) i++; return i; };
export class Typer {
  typed = ''; ks = 0; bad = 0; blocked = 0;
  constructor(public text: string) {}
  /** t = seconds since the official start. Returns true if the typed string changed. */
  key(k: string, t: number): boolean {
    if (t < 0 || typeof k !== 'string') return false;
    if (k === '\b') { if (!this.typed.length) return false; this.typed = this.typed.slice(0, -1); return true; }
    if (k.length !== 1 || k.charCodeAt(0) < 32 || k.charCodeAt(0) > 126 || this.typed.length >= this.text.length) return false;
    if (this.typed.length >= Math.floor(t * MAX_CPS) + 3) { this.blocked++; return false; }
    this.ks++; if (k !== this.text[this.typed.length]) this.bad++; this.typed += k; return true;
  }
  get prefix() { return prefixLen(this.text, this.typed); }
  get complete() { return this.typed === this.text; }
  get accuracy() { return this.ks ? ((this.ks - this.bad) / this.ks) * 100 : 100; }
}
export const r1 = (n: number) => Math.round(n * 10) / 10;

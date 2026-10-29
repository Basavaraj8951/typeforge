import { Typer, r1 } from './engine.js';
export const B = { HP: 100, BASE: 0.12, STEP: 10, MAX_COMBO: 5, GAIN: 1, LOSS: 15 };
export const comboOf = (streak: number) => Math.min(B.MAX_COMBO, 1 + Math.floor(streak / B.STEP));
export const attackName = (combo: number) => (combo >= 4 ? 'Speed Blast' : combo >= 3 ? 'Combo Attack' : 'Typing Strike');
interface BP { id: string; name: string; typer: Typer; hp: number; power: number; streak: number; maxPrefix: number; mistakes: number; maxCombo: number; inError: boolean; attacks: number; lastAttack: { name: string; dmg: number; n: number } | null }
/** Fictional score battle: correct letters build combo and power and drain the opponent's HP (game points). Mistakes break combo and cut power. */
export class BattleEngine {
  p = new Map<string, BP>(); winner: string | null = null; reason: 'hp' | 'text' | 'forfeit' | 'time' | null = null; endSec: number | null = null;
  constructor(public text: string, players: { id: string; name: string }[]) { for (const q of players) this.p.set(q.id, { id: q.id, name: q.name, typer: new Typer(text), hp: B.HP, power: 0, streak: 0, maxPrefix: 0, mistakes: 0, maxCombo: 1, inError: false, attacks: 0, lastAttack: null }); }
  private foe(id: string) { return [...this.p.values()].find(x => x.id !== id)!; }
  private end(winner: string, reason: NonNullable<BattleEngine['reason']>, t: number) { if (this.winner) return; this.winner = winner; this.reason = reason; this.endSec = t; }
  key(id: string, k: string, t: number) {
    if (this.winner) return; const me = this.p.get(id); if (!me || !me.typer.key(k, t)) return;
    const foe = this.foe(id), pre = me.typer.prefix, wrong = me.typer.typed.length > pre;
    if (wrong && !me.inError) { me.inError = true; me.mistakes++; me.streak = 0; me.power = Math.max(0, me.power - B.LOSS); }
    if (!wrong) me.inError = false;
    while (me.maxPrefix < pre) { // only never-before-confirmed letters deal damage, so backspacing cannot be farmed
      me.maxPrefix++; me.streak++; me.power = Math.min(100, me.power + B.GAIN);
      const combo = comboOf(me.streak), dmg = B.BASE * combo * (0.5 + me.power / 100); me.maxCombo = Math.max(me.maxCombo, combo);
      foe.hp = Math.max(0, foe.hp - dmg); me.lastAttack = { name: attackName(combo), dmg: r1(dmg * 100) / 100, n: ++me.attacks };
      if (foe.hp <= 0) return this.end(id, 'hp', t);
    }
    if (me.maxPrefix >= this.text.length) this.end(me.hp >= foe.hp ? id : foe.id, 'text', t);
  }
  forfeit(id: string, t: number) { this.end(this.foe(id).id, 'forfeit', t); }
  timeout(t: number) { const [a, b] = [...this.p.values()]; this.end(a.hp !== b.hp ? (a.hp > b.hp ? a.id : b.id) : a.maxPrefix >= b.maxPrefix ? a.id : b.id, 'time', t); }
  snapshot() { return [...this.p.values()].map(x => ({ id: x.id, hp: r1(x.hp), power: Math.round(x.power), streak: x.streak, combo: comboOf(x.streak), progress: x.typer.prefix / this.text.length, attack: x.lastAttack })); }
  results(t: number) {
    return [...this.p.values()].map(x => ({ id: x.id, name: x.name, won: this.winner === x.id, place: this.winner === x.id ? 1 : 2, hp: Math.round(x.hp), mistakes: x.mistakes, maxCombo: x.maxCombo, progress: Math.round((x.typer.prefix / this.text.length) * 100), wpm: t >= 1 ? r1(x.maxPrefix / 5 / (t / 60)) : 0, accuracy: r1(x.typer.accuracy) })).sort((a, b) => a.place - b.place);
  }
}

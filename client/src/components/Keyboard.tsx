import { FC, FM, ROWS, needs } from '../utils/keyboard';
export interface Fx { key: string; kind: 'hit' | 'nope'; n: number }
export default function Keyboard({ target, guide, fx }: { target?: string; guide: boolean; fx: Fx | null }) {
  const t = target ? needs(target) : null;
  const key = (k: string, label: string, color: string, cls = '') => {
    const on = !!t && (t.key === k || (k === 'ShiftL' && t.shift === 'L') || (k === 'ShiftR' && t.shift === 'R'));
    const f = fx && (fx.key === k) ? fx : null;
    return (
      <div key={k + (f ? f.n : '')} data-k={k}
        className={`relative grid min-w-0 place-items-center rounded-md border font-mono font-semibold text-[clamp(11px,3.2vw,17px)] ${cls} ${f ? (f.kind === 'hit' ? 'k-hit' : 'k-nope') : ''} ${on ? 'z-10 scale-110 text-white ring-2 ring-offset-2' : 'text-slate-800'}`}
        style={{ background: on ? (guide ? color : '#1e293b') : guide ? `color-mix(in srgb, ${color} 22%, white)` : '#fff', borderColor: guide ? color : '#cbd5e1', ['--tw-ring-color' as string]: guide ? color : '#1e293b' }}>
        {label}{(k === 'f' || k === 'j') && <i className="absolute bottom-[16%] h-0.5 w-[36%] rounded bg-current opacity-60" />}
      </div>);
  };
  return (
    <div className="select-none" aria-hidden="true">
      {ROWS.map((row, ri) => (
        <div key={ri} className="mb-1 flex gap-1 sm:gap-1.5" style={{ paddingLeft: ri < 3 ? ri * 3 + '%' : 0 }}>
          {ri === 3 && <div className="flex-[1.6]">{key('ShiftL', 'Shift', FC[0], 'h-full w-full')}</div>}
          {[...row].map(k => <div key={k} className="aspect-square flex-1 min-w-0">{key(k, k, FC[FM[k]], 'h-full w-full')}</div>)}
          {ri === 3 && <div className="flex-[1.6]">{key('ShiftR', 'Shift', FC[7], 'h-full w-full')}</div>}
        </div>))}
      <div className="mx-auto mt-1 h-9 w-1/2">{key(' ', 'space', FC[8], 'h-full w-full text-[12px]')}</div>
    </div>);
}

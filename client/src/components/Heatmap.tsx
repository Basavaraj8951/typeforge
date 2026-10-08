import { ROWS } from '../utils/keyboard';
/** Keyboard heatmap: darker keys = more mistakes. */
export default function Heatmap({ counts }: { counts: Record<string, number> }) {
  const c: Record<string, number> = {};
  for (const [k, n] of Object.entries(counts)) c[k.toLowerCase()] = (c[k.toLowerCase()] || 0) + n;
  const max = Math.max(1, ...Object.values(c)); const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const key = (k: string, label = k) => { const n = c[k] || 0, t = n ? 0.15 + 0.85 * (n / max) : 0; return <div key={k} title={`${label}: ${n} mistake${n === 1 ? '' : 's'}`} className="grid aspect-square min-w-0 flex-1 place-items-center rounded-md border border-slate-200 bg-white font-mono text-[clamp(10px,2.8vw,15px)] font-semibold" style={{ background: n ? `rgba(214,51,108,${t})` : undefined, color: t > 0.5 ? '#fff' : undefined }}>{label}</div>; };
  return (
    <figure>
      <div aria-hidden="true">{ROWS.map((r, i) => <div key={r} className="mb-1 flex gap-1" style={{ paddingLeft: i * 3 + '%' }}>{[...r].map(k => key(k))}</div>)}
        <div className="mx-auto mt-1 flex w-1/2">{(() => { const n = c[' '] || 0; return <div className="h-8 w-full rounded-md border border-slate-200 text-center text-xs leading-8" style={{ background: n ? `rgba(214,51,108,${0.15 + 0.85 * (n / max)})` : '#fff' }}>space</div>; })()}</div></div>
      <figcaption className="mt-2 text-sm text-slate-600">{top.length ? <>Most mistakes: {top.map(([k, n]) => `${k === ' ' ? 'space' : k.toUpperCase()} (${n})`).join(', ')}.</> : 'No mistakes recorded yet.'}</figcaption>
    </figure>);
}

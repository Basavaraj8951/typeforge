export default function Seg({ v, cur, set, label }: { v: string[]; cur: string; set: (x: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
      {v.map(x => <button key={x} aria-pressed={x === cur} onClick={() => set(x)} className={'min-h-10 rounded-lg px-3 text-sm capitalize ' + (x === cur ? 'bg-slate-900 text-white' : 'text-slate-600')}>{x}</button>)}
    </div>);
}

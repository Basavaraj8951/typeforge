import { FC } from '../utils/keyboard';
const LH = [0, 1, 2, 3], RH = [4, 5, 6, 7], H = [38, 50, 56, 48];
export default function Hands({ active }: { active: number[] }) {
  const fill = (f: number) => (active.includes(f) ? FC[f] : '#e2e8f0');
  const hand = (ids: number[], x: number, heights: number[], thumbX: number) => (
    <g>
      <rect x={x} y={52} width={96} height={34} rx={10} fill="#f1f5f9" />
      {ids.map((f, i) => <rect key={f} x={x + i * 24} y={52 - heights[i]} width={20} height={heights[i] + 6} rx={9} fill={fill(f)} />)}
      <rect x={thumbX} y={62} width={20} height={26} rx={9} fill={fill(8)} />
    </g>);
  return (
    <svg viewBox="0 0 260 92" className="mx-auto h-24 w-full max-w-sm" role="img" aria-label="Hand diagram showing which finger to use">
      {hand(LH, 8, H, 108)}{hand(RH, 156, [...H].reverse(), 132)}
    </svg>);
}

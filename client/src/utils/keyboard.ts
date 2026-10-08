export const FINGERS = ['Left pinky', 'Left ring', 'Left middle', 'Left index', 'Right index', 'Right middle', 'Right ring', 'Right pinky', 'Thumb'];
export const FC = ['#e64980', '#f76707', '#37b24d', '#1c7ed6', '#7048e8', '#15aabf', '#f59f00', '#ae3ec9', '#868e96'];
const MAP = ['1qaz', '2wsx', '3edc', '45rtfgvb', '67yuhjnm', '8ik,', '9ol.', '0p;/', ' '];
export const FM: Record<string, number> = {};
MAP.forEach((ks, i) => [...ks].forEach(k => (FM[k] = i)));
const SHIFTED: Record<string, string> = { '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', ':': ';', '?': '/', '<': ',', '>': '.' };
export const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
export interface Need { key: string; shift: 'L' | 'R' | null; finger: number; text: string }
/** Which key, finger and Shift (if any) are needed to type a character. */
export function needs(ch: string): Need | null {
  if (ch === ' ') return { key: ' ', shift: null, finger: 8, text: 'Press space with either thumb' };
  const shifted = SHIFTED[ch] !== undefined || /[A-Z]/.test(ch);
  const key = SHIFTED[ch] ?? ch.toLowerCase(); const finger = FM[key];
  if (finger === undefined) return null;
  const shift = shifted ? (finger < 4 ? 'R' : 'L') : null;
  const base = `Use your ${FINGERS[finger].toLowerCase()} finger`;
  return { key, shift, finger, text: shift ? `${base} and hold Shift with your ${shift === 'R' ? 'right' : 'left'} pinky` : base };
}

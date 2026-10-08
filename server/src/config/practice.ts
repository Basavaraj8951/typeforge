import { PASSAGES } from './passages.js';
export type Mode = 'intermediate' | 'advanced' | 'pro';
export const KINDS: Record<Mode, string[]> = {
  intermediate: ['words', 'sentences', 'paragraphs', 'numbers', 'punctuation', 'capitals', 'mixed'],
  advanced: ['paragraphs', 'vocabulary', 'technical', 'symbols', 'code'],
  pro: ['extreme', 'longform', 'programming', 'random', 'competitive'],
};
export const LANGS = ['javascript', 'python', 'java', 'c', 'cpp', 'html', 'css', 'sql'] as const;
const WORDS = 'the of and to in is you that it was for on are as with they at be this from have or one had not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much before go good new write our me man too any day same right look think also around another came come work three word must because does part even place well such here take why help put different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always looked show large often together asked house world going want school important until form food keep children feet land side without once animal life enough took sometimes four head above kind began almost live page got earth need far hand high year mother light country father let night picture study second soon story since white ever paper hard near sentence better best across during today however sure knew try told young sun thing whole hear example heard several change answer room sea against top turned learn point city play toward five using himself usually'.split(' ');
const SENTENCES = ['The train left the station a few minutes early.', 'She kept a small notebook for every new idea.', 'We walked along the river until the sun went down.', 'Good practice is short, regular, and focused.', 'He fixed the bike with a wrench and a lot of patience.', 'The library was quiet except for the sound of pages turning.', 'Fresh bread and strong coffee made the morning better.', 'They planned the trip carefully and still forgot the map.', 'A clear desk often leads to a clear head.', 'The teacher asked everyone to read the last paragraph again.', 'Rain on the roof is a good reason to stay inside and read.', 'Our team finished the project two days before the deadline.'];
const PUNCT = [`Well, it works; however, it's rather slow.`, `She asked, "Are you ready?" He nodded and said, "Yes!"`, `First, mix the flour; second, add the eggs; finally, wait.`, `It isn't easy, but it's worth it: practice, patience, repeat.`, `Wait... what happened? Nobody knows, and nobody's telling.`, `The list had three items: milk, bread, and eggs.`, `"Stop," she said, "and think before you type."`, `Don't rush; accuracy matters more than speed, doesn't it?`];
const TITLES = ['The Great Barrier Reef', 'New York City', 'Mount Everest', 'The Pacific Ocean', 'Dr. Maria Lopez', 'The United Nations', 'Lake Victoria', 'The Silk Road', 'Captain James Cook', 'Monday Morning Meeting', 'The Amazon Rainforest', 'Tokyo Tower', 'The Roman Empire', 'Ms. Priya Sharma', 'Cape Town'];
const VOCAB = 'ephemeral meticulous ubiquitous paradigm juxtaposition serendipity resilient ambiguous pragmatic eloquent unprecedented quintessential ostensibly perfunctory idiosyncratic ameliorate conundrum surreptitious magnanimous inexorable fastidious vicarious equivocal tenacious ineffable'.split(' ');
const TERMS = 'algorithm latency throughput middleware encryption serialization polymorphism concurrency idempotent checksum bandwidth virtualization authentication repository refactoring compiler asynchronous scalability redundancy microservice normalization cryptography'.split(' ');
const SYMS = ['user@example.com', '#hashtag', '$1,250.99', '50% off', 'a && b || !c', 'x = (y + 3) * 4;', '{ key: [1, 2] }', 'C:/temp/file_01.txt', 'https://example.com/a?b=1&c=2', '~/docs/*.md', 'n^2 + 3n - 7 = 0', '<tag attr="v">', 'arr[i] += 2;', 'if (a != b) { go(); }'];
const ADV_PARAS = ['The committee concluded that incremental reforms, although politically convenient, had failed to address the structural weaknesses that repeatedly undermined public confidence; consequently, it recommended a comprehensive review of procurement, accountability, and oversight mechanisms.', 'Photosynthetic efficiency varies considerably across species, depending on how leaves regulate carbon dioxide intake, manage water loss, and distribute absorbed light between competing biochemical pathways within the chloroplast.'];
const CODE: Record<string, string[]> = {
  javascript: ['const sum = (a, b) => a + b; const nums = [1, 2, 3].map(n => n * 2); console.log(sum(nums[0], nums[1]));', 'async function load(id) { const res = await fetch(`/api/items/${id}`); if (!res.ok) throw new Error("failed"); return res.json(); }', 'const counts = {}; for (const w of words) { counts[w] = (counts[w] || 0) + 1; } export default counts;'],
  python: ["def average(xs): return sum(xs) / len(xs) if xs else 0; scores = [72, 85, 91]; print(f'Average: {average(scores):.1f}')", 'class Player: def __init__(self, name): self.name = name; self.wins = 0; def win(self): self.wins += 1', 'words = [w.lower() for w in text.split() if len(w) > 3]; unique = sorted(set(words)); print(unique[:5])'],
  java: ['public static int max(int[] a) { int m = a[0]; for (int x : a) { if (x > m) m = x; } return m; }', 'List<String> names = new ArrayList<>(); names.add("Ada"); for (String n : names) { System.out.println(n); }', 'public class Counter { private int value = 0; public void increment() { value++; } public int get() { return value; } }'],
  c: ['#include <stdio.h> int main(void) { int n = 5; for (int i = 0; i < n; i++) { printf("%d\\n", i * i); } return 0; }', 'int factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); }', "char *s = \"typeforge\"; int len = 0; while (s[len] != '\\0') { len++; }"],
  cpp: ['#include <vector> #include <algorithm> std::vector<int> v = {3, 1, 2}; std::sort(v.begin(), v.end());', 'template <typename T> T maxOf(T a, T b) { return (a > b) ? a : b; }', 'for (auto &item : items) { total += item.price * item.qty; } std::cout << total << std::endl;'],
  html: ['<nav class="menu"><a href="/home">Home</a><a href="/about">About</a></nav>', '<form action="/login" method="post"><input type="email" name="email" required><button type="submit">Log in</button></form>', '<ul id="list"><li>One</li><li>Two</li><li class="done">Three</li></ul>'],
  css: ['.card { display: flex; gap: 12px; padding: 16px; border-radius: 8px; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }', '@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } h1 { font-size: 1.5rem; } }', 'button:hover { transform: translateY(-1px); transition: transform 0.2s ease-in-out; }'],
  sql: ['SELECT name, email FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 20;', "UPDATE orders SET status = 'shipped' WHERE id IN (SELECT order_id FROM shipments WHERE sent = 1);", 'CREATE TABLE scores (id INT PRIMARY KEY, user_id INT NOT NULL, wpm DECIMAL(5,1), taken_at TIMESTAMP);'],
};
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
const NUM = () => rnd([() => digits(3 + Math.floor(Math.random() * 3)), () => `${digits(2)}.${digits(1 + Math.floor(Math.random() * 2))}`, () => `${1 + Math.floor(Math.random() * 9)},${digits(3)}`, () => `20${digits(2)}`, () => `${digits(2)}%`])();
const plain = PASSAGES.filter(p => p.category !== 'programming');
const MED = plain.filter(p => p.difficulty === 'easy' || p.difficulty === 'medium').map(p => p.text);
const HARD = [...plain.filter(p => p.difficulty === 'hard' || p.difficulty === 'expert').map(p => p.text), ...ADV_PARAS];
const anyCode = (lang?: string) => rnd(CODE[lang && CODE[lang] ? lang : rnd([...LANGS])]);
function gen(mode: Mode, kind: string, lang: string): () => string {
  const mixed = () => rnd([() => rnd(WORDS), () => rnd(SENTENCES), NUM, () => rnd(PUNCT), () => rnd(TITLES)])();
  if (mode === 'intermediate') return ({ words: () => rnd(WORDS), sentences: () => rnd(SENTENCES), paragraphs: () => rnd(MED), numbers: NUM, punctuation: () => rnd(PUNCT), capitals: () => rnd(TITLES) } as Record<string, () => string>)[kind] ?? mixed;
  if (mode === 'advanced') return ({ paragraphs: () => rnd(HARD), vocabulary: () => rnd(VOCAB), technical: () => rnd(TERMS), symbols: () => rnd(SYMS), code: () => rnd(CODE[lang] ?? CODE.javascript) } as Record<string, () => string>)[kind] ?? (() => rnd(HARD));
  return ({ extreme: () => rnd(HARD), competitive: () => rnd(HARD), longform: () => rnd([...HARD, ...MED]), programming: () => anyCode(lang), random: () => rnd([() => rnd(HARD), () => rnd(MED), () => anyCode(), () => rnd(SYMS), () => rnd(VOCAB)])() } as Record<string, () => string>)[kind] ?? (() => rnd(HARD));
}
export function buildPractice(mode: Mode, kind: string, lang: string, duration: number): string {
  const need = Math.min(4000, Math.max(120, duration * (kind === 'extreme' || kind === 'competitive' ? 12 : 8)));
  const g = gen(mode, kind, lang); let s = '', last = '';
  while (s.length < need) { let x = g(); for (let i = 0; i < 3 && x === last; i++) x = g(); last = x; s += (s ? ' ' : '') + x; }
  return s;
}
/** Custom text: printable ASCII only, whitespace collapsed, 20-2000 chars. */
export function sanitizeCustom(t: string): string | null {
  const s = t.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim().slice(0, 2000);
  return s.length >= 20 ? s : null;
}

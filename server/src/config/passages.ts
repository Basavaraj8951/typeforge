export interface Passage { id: string; category: string; difficulty: 'easy' | 'medium' | 'hard' | 'expert'; text: string }
export const PASSAGES: Passage[] = [
  { id: 'g1', category: 'general', difficulty: 'easy', text: 'Typing well is a skill you build one small habit at a time. Keep your wrists relaxed, your eyes on the screen, and your fingers close to the home row. Speed follows accuracy, so slow down until the mistakes disappear.' },
  { id: 'g2', category: 'general', difficulty: 'easy', text: 'A good morning starts with a glass of water and a short walk. Pick one thing to finish before noon and give it your full attention. Small wins add up faster than most people expect.' },
  { id: 't1', category: 'technology', difficulty: 'medium', text: 'A browser sends a request, a server finds the right data, and the response travels back in a fraction of a second. Caching keeps popular pages close to the people who ask for them, which saves time and bandwidth.' },
  { id: 't2', category: 'technology', difficulty: 'medium', text: 'Passwords work best when they are long, unique, and stored in a manager. Two-factor codes add a second lock, so a stolen password alone is not enough to open an account.' },
  { id: 's1', category: 'science', difficulty: 'medium', text: 'Plants turn sunlight, water, and carbon dioxide into sugar and oxygen. This quiet chemistry feeds nearly every food chain on Earth, from tiny insects to the largest whales.' },
  { id: 'e1', category: 'education', difficulty: 'medium', text: 'Students remember more when they test themselves instead of rereading notes. Spacing study sessions across several days helps ideas move into long-term memory.' },
  { id: 'q1', category: 'quotes', difficulty: 'medium', text: 'Practice does not make perfect; careful practice makes progress. Measure it, adjust it, and repeat it tomorrow.' },
  { id: 'b1', category: 'business', difficulty: 'hard', text: 'Quarterly revenue rose 12.4% after the team simplified pricing, cut onboarding time from 9 days to 3, and reduced churn among small accounts; however, support costs climbed, so hiring remains the next priority.' },
  { id: 's2', category: 'science', difficulty: 'hard', text: 'Entropy, loosely speaking, measures how many microscopic arrangements match what we observe; in an isolated system it tends to increase, which is why heat flows from hot objects to cold ones.' },
  { id: 'p1', category: 'programming', difficulty: 'hard', text: 'const total = items.filter(i => i.price > 0).reduce((sum, i) => sum + i.price * i.qty, 0); console.log(`Total: $${total.toFixed(2)}`);' },
  { id: 'p2', category: 'programming', difficulty: 'hard', text: 'def fibonacci(n): a, b = 0, 1; for _ in range(n): a, b = b, a + b; return a' },
  { id: 'p3', category: 'programming', difficulty: 'expert', text: 'SELECT u.name, COUNT(t.id) AS tests FROM users u JOIN tests t ON t.user_id = u.id WHERE t.wpm >= 60 GROUP BY u.name ORDER BY tests DESC LIMIT 10;' },
  { id: 't3', category: 'technology', difficulty: 'expert', text: 'Asynchronous systems trade simplicity for throughput: when a queue absorbs bursts, downstream workers can retry failed jobs idempotently, yet engineers must still reason carefully about ordering, back-pressure, and partial failure.' },
];
const byId = new Map(PASSAGES.map(p => [p.id, p]));
export function pickIds(category: string, difficulty: string, duration: number): string[] {
  const cat = (p: Passage) => category === 'random' || p.category === category;
  let pool = PASSAGES.filter(p => cat(p) && p.difficulty === difficulty);
  if (!pool.length) pool = PASSAGES.filter(cat);
  if (!pool.length) pool = PASSAGES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const ids: string[] = []; let len = 0;
  for (let i = 0; len < duration * 8; i++) { const p = shuffled[i % shuffled.length]; ids.push(p.id); len += p.text.length + 1; }
  return ids;
}
export const textFor = (ids: string[]) => ids.map(id => byId.get(id)?.text ?? '').join(' ');
export const validIds = (ids: string[]) => ids.every(id => byId.has(id));

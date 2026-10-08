export interface Lesson { id: number; title: string; summary: string; instructions: string; newKeys: string; keys: string; kind: 'drill' | 'caps' | 'numbers' | 'symbols' | 'words' | 'sentences' }
export const LESSONS: Lesson[] = [
  { id: 1, title: 'F and J', summary: 'Anchor your index fingers', instructions: 'Rest your index fingers on the raised bars of F and J. Look for the bars on the keyboard below. These keys are your anchors.', newKeys: 'fj', keys: 'fj', kind: 'drill' },
  { id: 2, title: 'D and K', summary: 'Add your middle fingers', instructions: 'Middle fingers rest on D and K. Keep your index fingers on F and J.', newKeys: 'dk', keys: 'dkfj', kind: 'drill' },
  { id: 3, title: 'S and L', summary: 'Add your ring fingers', instructions: 'Ring fingers cover S and L. Return to the home keys after every press.', newKeys: 'sl', keys: 'sldkfj', kind: 'drill' },
  { id: 4, title: 'A and ;', summary: 'Add your pinkies', instructions: 'Pinkies cover A and semicolon. You now have eight home-row keys under your fingers.', newKeys: 'a;', keys: 'a;sldkfj', kind: 'drill' },
  { id: 5, title: 'Home row', summary: 'G and H complete the row', instructions: 'Index fingers stretch inward to G and H, then return to F and J.', newKeys: 'gh', keys: 'asdfghjkl;', kind: 'drill' },
  { id: 6, title: 'Top row', summary: 'Reach up from home', instructions: 'Reach up with the same finger, then return home. Do not look at your hands.', newKeys: 'qwertyuiop', keys: 'qwertyuiopasdfjkl', kind: 'drill' },
  { id: 7, title: 'Bottom row', summary: 'Curl down and back', instructions: 'Curl your fingers down to the bottom row and return home each time.', newKeys: 'zxcvbnm,.', keys: 'zxcvbnm,.asdfjkl', kind: 'drill' },
  { id: 8, title: 'Capital letters', summary: 'Use Shift with the opposite pinky', instructions: 'Hold Shift with the pinky on the opposite hand from the letter, then release it right away.', newKeys: '', keys: '', kind: 'caps' },
  { id: 9, title: 'Numbers', summary: 'Reach to the number row', instructions: 'Reach up two rows with the matching finger and keep your wrists steady.', newKeys: '1234567890', keys: '1234567890', kind: 'numbers' },
  { id: 10, title: 'Symbols', summary: 'Punctuation and Shift symbols', instructions: 'Most symbols need Shift. Use the opposite pinky for Shift, just like capital letters.', newKeys: '', keys: '', kind: 'symbols' },
  { id: 11, title: 'Words', summary: 'Real words, steady rhythm', instructions: 'Type whole words with an even rhythm. Accuracy first, speed second.', newKeys: '', keys: '', kind: 'words' },
  { id: 12, title: 'Sentences', summary: 'Capitals, commas and full stops', instructions: 'Put it all together: capitals, punctuation and spaces. Use your thumb for the space bar.', newKeys: '', keys: '', kind: 'sentences' },
];
const WORDS = 'the and for you that with have this from they will would there their what about which when make like time just know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us'.split(' ');
const NAMES = ['Sam', 'Kate', 'Lena', 'Omar', 'Rita', 'Jack', 'Nina', 'Paul', 'Zoe', 'Hugo', 'Mia', 'Dave', 'Eli', 'Tara', 'Ben'];
const SYMS = ['ok!', 'why?', '(yes)', 'a@b.c', '5%', '$20', '#1', 'a&b', '*star*', 'yes; no', '1,2,3', 'x/y', 'a:b', 'wow!', '(a)'];
const SENT = ['Typing is a skill you can learn.', 'Keep your fingers on the home row.', 'Slow and steady wins the race.', 'Accuracy comes first, then speed.', 'Take a short break every hour.', 'Good habits make hard tasks easy.', 'Look at the screen, not the keys.', 'Small steps lead to big progress.'];
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const many = <T,>(a: T[], n: number) => Array.from({ length: n }, () => rnd(a));
export function buildText(l: Lesson): string {
  switch (l.kind) {
    case 'caps': return many(NAMES, 8).join(' ');
    case 'numbers': return Array.from({ length: 9 }, () => Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => rnd([...'1234567890'])).join('')).join(' ');
    case 'symbols': return many(SYMS, 9).join(' ');
    case 'words': return many(WORDS, 10).join(' ');
    case 'sentences': { const a = rnd(SENT); return a + ' ' + rnd(SENT.filter(s => s !== a)); }
    default: { const pool = [...l.newKeys.repeat(3), ...l.keys]; return Array.from({ length: 11 }, () => Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => rnd(pool)).join('')).join(' '); }
  }
}

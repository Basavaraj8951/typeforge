export interface AStats { tests: number; bestWpm: number; perfect: boolean; streak: number; races: number; battles: number; raceWins: number; battleWins: number }
export interface Ach { id: string; title: string; description: string; icon: string; test: (s: AStats) => boolean }
const t = (n: number, id: string, title: string, icon: string): Ach => ({ id, title, description: n === 1 ? 'Complete your first typing test.' : `Complete ${n} typing tests.`, icon, test: s => s.tests >= n });
const w = (n: number, icon: string): Ach => ({ id: 'wpm_' + n, title: `${n} WPM`, description: `Reach ${n} WPM in a typing test.`, icon, test: s => s.bestWpm >= n });
const k = (n: number, icon: string): Ach => ({ id: 'streak_' + n, title: `${n} Day Streak`, description: `Practice ${n} days in a row.`, icon, test: s => s.streak >= n });
const v = (n: number, icon: string): Ach => ({ id: 'wins_' + n, title: `${n} Wins`, description: `Win ${n} races or battles.`, icon, test: s => s.raceWins + s.battleWins >= n });
export const ACHIEVEMENTS: Ach[] = [
  t(1, 'first_test', 'First Test', '🎯'), t(10, 'tests_10', '10 Tests', '🔟'), t(50, 'tests_50', '50 Tests', '📈'), t(100, 'tests_100', '100 Tests', '💯'), t(1000, 'tests_1000', '1000 Tests', '🏛️'),
  w(30, '🐢'), w(50, '🚶'), w(75, '🏃'), w(100, '⚡'), w(120, '🚀'), w(150, '🔥'),
  { id: 'perfect_accuracy', title: 'Perfect Accuracy', description: 'Finish a test of 30+ characters with 100% accuracy.', icon: '🎯', test: s => s.perfect },
  k(7, '📅'), k(30, '🗓️'), k(100, '👑'),
  { id: 'first_race', title: 'First Race', description: 'Finish your first race.', icon: '🏁', test: s => s.races >= 1 },
  { id: 'first_battle', title: 'First Battle', description: 'Finish your first battle.', icon: '⚔️', test: s => s.battles >= 1 },
  v(10, '🥉'), v(50, '🥈'), v(100, '🥇'),
];
export const earned = (s: AStats) => ACHIEVEMENTS.filter(a => a.test(s));

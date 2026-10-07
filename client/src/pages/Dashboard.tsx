import { useAuth } from '../store/auth';
export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-extrabold">Welcome back, {user?.username}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm"><b className="text-2xl capitalize">{user?.level}</b><p className="text-sm text-slate-500">Level</p></div>
        <div className="rounded-xl bg-white p-4 shadow-sm"><b className="text-2xl">{user?.xp}</b><p className="text-sm text-slate-500">XP</p></div>
      </div>
      <p className="mt-6 text-slate-500">Typing tests, lessons and racing arrive in the next phases.</p>
      <button onClick={logout} className="mt-4 rounded-lg border border-slate-300 px-4 py-2">Log out</button>
    </main>);
}

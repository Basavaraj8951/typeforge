import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
const fields: Record<'login' | 'register', [string, string, string][]> = {
  login: [['identifier', 'Email or username', 'text'], ['password', 'Password', 'password']],
  register: [['name', 'Name', 'text'], ['username', 'Username', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['confirm', 'Confirm password', 'password']],
};
export default function AuthForm({ kind }: { kind: 'login' | 'register' }) {
  const [v, setV] = useState<Record<string, string>>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const { login, register } = useAuth(); const nav = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    if (kind === 'register' && v.password !== v.confirm) return setErr('Passwords do not match.');
    setBusy(true);
    try { kind === 'login' ? await login(v.identifier, v.password) : await register({ name: v.name, username: v.username, email: v.email, password: v.password }); nav('/dashboard'); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-extrabold">{kind === 'login' ? 'Log in' : 'Create your account'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {fields[kind].map(([k, label, type]) => (
          <label key={k} className="block text-sm font-medium">{label}
            <input required type={type} value={v[k] || ''} onChange={e => setV({ ...v, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ember" />
          </label>))}
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-ember py-2.5 font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : kind === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">{kind === 'login' ? <>New here? <Link className="underline" to="/register">Create an account</Link></> : <>Have an account? <Link className="underline" to="/login">Log in</Link></>}</p>
    </main>);
}

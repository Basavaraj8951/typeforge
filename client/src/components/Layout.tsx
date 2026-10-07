import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
const cls = ({ isActive }: { isActive: boolean }) => 'rounded-lg px-3 py-2 text-sm font-medium ' + (isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100');
export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
          <Link to="/" className="text-xl font-extrabold">Type<span className="text-ember">Forge</span></Link>
          <nav aria-label="Main" className="hidden gap-1 md:flex"><NavLink to="/test" className={cls}>Typing test</NavLink>{user && <NavLink to="/dashboard" className={cls}>Dashboard</NavLink>}</nav>
          <div className="flex items-center gap-2 text-sm">{user ? <><span className="hidden sm:inline text-slate-600">{user.username}</span><button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-1.5">Log out</button></> : <><Link to="/login" className="px-2 py-1.5">Log in</Link><Link to="/register" className="rounded-lg bg-ember px-3 py-1.5 font-bold text-white">Sign up free</Link></>}</div>
        </div>
      </header>
      <Outlet />
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-slate-200 bg-white py-1 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[['/', 'Home'], ['/test', 'Test'], [user ? '/dashboard' : '/login', user ? 'Dashboard' : 'Log in']].map(([to, l]) => <NavLink key={l} to={to} end className={({ isActive }) => 'flex min-h-12 flex-1 items-center justify-center text-sm font-semibold ' + (isActive ? 'text-ember' : 'text-slate-500')}>{l}</NavLink>)}
      </nav>
    </div>);
}

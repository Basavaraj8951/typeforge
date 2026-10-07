import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-8 text-slate-500">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

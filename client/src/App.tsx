import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthForm from './pages/AuthForm';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Test from './pages/Test';
import Lessons from './pages/Lessons';
import Lesson from './pages/Lesson';
export default function App() {
  const load = useAuth(s => s.load);
  useEffect(() => { load(); }, [load]);
  return (
    <BrowserRouter>
      <Routes><Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/learn" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
        <Route path="/beginner" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
        <Route path="/learn/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        <Route path="/login" element={<AuthForm kind="login" />} />
        <Route path="/register" element={<AuthForm kind="register" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<main className="p-8"><h1 className="text-2xl font-bold">Page not found</h1></main>} />
      </Route></Routes>
    </BrowserRouter>);
}

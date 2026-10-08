import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Runner, { type Round } from '../components/Runner';
import { api } from '../services/api';
export default function WeakPractice() {
  const nav = useNavigate(); useEffect(() => { document.title = 'Weak Key Practice | TypeForge'; }, []);
  return <main className="mx-auto max-w-3xl p-4"><h1 className="mb-3 text-2xl font-extrabold">Weak-key practice</h1><Runner getRound={() => api<Round>('/practice/weak')} onBack={() => nav('/progress')} /></main>;
}

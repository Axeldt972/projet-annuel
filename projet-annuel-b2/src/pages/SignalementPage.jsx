import React from 'react';
import { useAuth } from '../context/AuthContext';
import SignalementForm from '../components/SignalementForm';
import LoginForm from '../components/LoginForm';
import { useLocation } from 'react-router-dom';

export default function SignalementPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSalle = params.get('salle') || '';

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (!user) return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
      <div className="bg-white/70 rounded-2xl shadow-2xl p-10 w-[400px] max-w-[90vw]">
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion requise</h1>
        <LoginForm />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-900 drop-shadow">Signaler un problème</h1>
        <SignalementForm initialSalle={initialSalle} />
      </div>
    </div>
  );
}

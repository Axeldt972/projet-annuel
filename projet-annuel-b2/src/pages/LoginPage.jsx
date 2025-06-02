import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (user) {
    window.location.replace('/dashboard');
    return null;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
      <div className="bg-white/70 rounded-2xl shadow-2xl p-10 w-[400px] max-w-[90vw]">
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}

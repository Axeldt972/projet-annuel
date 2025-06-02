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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded shadow p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}

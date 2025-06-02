import React from 'react';
import { ToastProvider } from './components/ToastProvider';
import './App.css';
import AppRouter from './router';
import useAuth from './hooks/useAuth';
import useUserRole from './hooks/useUserRole';

export default function App() {
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  return (
    <ToastProvider>
      <header className="w-full bg-gray-100 py-2 px-4 flex flex-col md:flex-row items-center justify-between mb-2 shadow">
        <div className="font-bold text-lg text-blue-900 mb-2 md:mb-0">CDP - Gestion des locaux</div>
        <nav className="flex flex-wrap gap-2 md:gap-4 items-center mb-2 md:mb-0" aria-label="Navigation principale">
          <a href="/signalement" className="text-blue-700 hover:underline font-medium" tabIndex={0} aria-label="Aller à la page de signalement">Signalement</a>
          <a href="/plan" className="text-blue-700 hover:underline font-medium" tabIndex={0} aria-label="Voir le plan interactif">Plan</a>
          {(role === 'admin' || role === 'technique') && (
            <a href="/dashboard" className="text-blue-700 hover:underline font-medium" tabIndex={0} aria-label="Accéder au dashboard technique">Dashboard</a>
          )}
          {role === 'admin' && (
            <a href="/admin" className="text-blue-700 hover:underline font-medium" tabIndex={0} aria-label="Accéder à l'administration">Admin</a>
          )}
          {user && (
            <>
              <a href="/profil" className="text-blue-700 hover:underline font-medium" tabIndex={0} aria-label="Voir mon profil">Profil</a>
              <button onClick={() => { window.localStorage.clear(); window.location.href = '/login'; }} className="ml-2 px-2 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400" aria-label="Se déconnecter">Déconnexion</button>
            </>
          )}
        </nav>
        {user && !loading && (
          <div className="text-sm text-gray-700 flex items-center gap-2">
            <span>Connecté :</span>
            <span className="font-semibold">{user.email}</span>
            {role && (
              <span className="px-2 py-1 rounded bg-blue-200 text-blue-800 uppercase text-xs">{role}</span>
            )}
          </div>
        )}
      </header>
      <main className="max-w-5xl mx-auto px-2 md:px-0">
        <AppRouter />
      </main>
    </ToastProvider>
  );
}

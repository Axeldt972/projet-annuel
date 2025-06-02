import React from 'react';
import { useAuth } from '../context/AuthContext';
import useUserRole from '../hooks/useUserRole';

const roleLabels = {
  admin: 'Administrateur',
  technique: 'Personnel technique',
  utilisateur: 'Utilisateur',
};

export default function HomePage() {
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  if (loading) return <div className="text-center mt-8">Chargement...</div>;

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
      <div className="w-[600px] max-w-[98vw] bg-white/70 rounded-2xl shadow-2xl p-10 text-center">
        <h1 className="text-2xl font-bold mb-2 text-blue-900">Bienvenue sur l'application de gestion des locaux</h1>
        {user && (
          <>
            <div className="mb-2 text-lg">Bonjour <span className="font-semibold">{user.email}</span></div>
            <div className="mb-4 text-blue-800">Rôle : <span className="uppercase font-semibold">{roleLabels[role] || role}</span></div>
          </>
        )}
        {role === 'admin' && (
          <div className="space-y-2">
            <a href="/dashboard" className="block py-2 px-4 bg-yellow-100 hover:bg-yellow-200 rounded font-medium">Accéder au dashboard technique</a>
            <a href="/admin" className="block py-2 px-4 bg-blue-100 hover:bg-blue-200 rounded font-medium">Accéder à l'administration</a>
            <a href="/plan" className="block py-2 px-4 bg-green-100 hover:bg-green-200 rounded font-medium">Voir le plan interactif</a>
          </div>
        )}
        {role === 'technique' && (
          <div className="space-y-2">
            <a href="/dashboard" className="block py-2 px-4 bg-yellow-100 hover:bg-yellow-200 rounded font-medium">Accéder au dashboard technique</a>
            <a href="/plan" className="block py-2 px-4 bg-green-100 hover:bg-green-200 rounded font-medium">Voir le plan interactif</a>
          </div>
        )}
        {role === 'utilisateur' && (
          <div className="space-y-2">
            <a href="/signalement" className="block py-2 px-4 bg-blue-100 hover:bg-blue-200 rounded font-medium">Signaler un problème</a>
            <a href="/plan" className="block py-2 px-4 bg-green-100 hover:bg-green-200 rounded font-medium">Voir le plan interactif</a>
          </div>
        )}
        {!role && (
          <div className="mt-4 text-red-700">Votre rôle n'est pas défini. Veuillez contacter l'administrateur.</div>
        )}
      </div>
    </div>
  );
}

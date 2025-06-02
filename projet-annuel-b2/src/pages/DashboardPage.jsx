import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import SignalementsTable from '../components/SignalementsTable';
import LoginForm from '../components/LoginForm';

import useUserRole from '../hooks/useUserRole';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <div className="text-center mt-8">Chargement...</div>;
  if (!user) {
    window.location.replace('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Fond glassmorphism pleine page */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl -z-10" />
      <Sidebar active="dashboard" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader />
        {/* Affichage du rôle pour debug */}
        <div className="w-full text-right px-8 pt-2 pb-0">
          <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 font-mono text-xs uppercase tracking-wide">Rôle détecté : {role || '...'}</span>
        </div>
        <main className="flex-1 px-8 py-8">
          {/* Cards stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard icon="📍" title="Signalements ouverts" value={12} color="border-blue-500" />
            <DashboardCard icon="✅" title="Signalements résolus" value={34} color="border-green-500" />
            <DashboardCard icon="📚" title="Salles" value={8} color="border-purple-500" />
            <DashboardCard icon="👥" title="Utilisateurs" value={5} color="border-yellow-500" />
          </div>

          {/* Activités récentes (placeholder) */}
          <div className="bg-white/90 rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
            <ul className="divide-y">
              <li className="py-2 flex items-center justify-between"><span>Signalement salle B12 résolu</span><span className="text-xs text-gray-400">il y a 2h</span></li>
              <li className="py-2 flex items-center justify-between"><span>Nouveau signalement salle A03</span><span className="text-xs text-gray-400">il y a 4h</span></li>
              <li className="py-2 flex items-center justify-between"><span>Nouvel utilisateur ajouté</span><span className="text-xs text-gray-400">hier</span></li>
            </ul>
          </div>

          {/* Table signalements */}
          <div className="bg-white/90 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tous les signalements</h2>
            <SignalementsTable />
          </div>
        </main>
      </div>
    </div>
  );
}

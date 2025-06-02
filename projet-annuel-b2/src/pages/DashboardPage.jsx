import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import SignalementsTable from '../components/SignalementsTable';
import LoginForm from '../components/LoginForm';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (!user) {
    window.location.replace('/login');
    return null;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar active="dashboard" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 px-8 py-8">
          {/* Cards stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard icon="📝" title="Signalements ouverts" value={12} color="border-blue-500" />
            <DashboardCard icon="✅" title="Signalements résolus" value={34} color="border-green-500" />
            <DashboardCard icon="📚" title="Salles" value={8} color="border-purple-500" />
            <DashboardCard icon="👥" title="Utilisateurs" value={5} color="border-yellow-500" />
          </div>

          {/* Activités récentes (placeholder) */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
            <ul className="divide-y">
              <li className="py-2 flex items-center justify-between"><span>Signalement salle B12 résolu</span><span className="text-xs text-gray-400">il y a 2h</span></li>
              <li className="py-2 flex items-center justify-between"><span>Nouveau signalement salle A03</span><span className="text-xs text-gray-400">il y a 4h</span></li>
              <li className="py-2 flex items-center justify-between"><span>Nouvel utilisateur ajouté</span><span className="text-xs text-gray-400">hier</span></li>
            </ul>
          </div>

          {/* Table signalements */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tous les signalements</h2>
            <SignalementsTable />
          </div>
        </main>
      </div>
    </div>
  );
}

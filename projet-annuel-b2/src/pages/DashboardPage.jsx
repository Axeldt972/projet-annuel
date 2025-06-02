import React from 'react';
import useAuth from '../hooks/useAuth';
import SignalementsTable from '../components/SignalementsTable';
import LoginForm from '../components/LoginForm';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (!user) return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
      <div className="bg-white rounded shadow p-4">
        <LoginForm />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord technique</h1>
      <SignalementsTable />
    </div>
  );
}

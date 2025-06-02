import React, { useState } from 'react';
import AdminSallesTable from '../components/AdminSallesTable';
import AdminUsersTable from '../components/AdminUsersTable';

const TABS = [
  { key: 'salles', label: 'Salles' },
  { key: 'users', label: 'Utilisateurs' },
];

export default function AdminPage() {
  const [tab, setTab] = useState('salles');

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
      <div className="w-[700px] max-w-[98vw] bg-white/70 rounded-2xl shadow-2xl p-10">
        <h1 className="text-2xl font-bold mb-4">Administration</h1>
        <div className="mb-4 flex gap-4">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="bg-white/90 rounded-xl shadow p-4">
          {tab === 'salles' && <AdminSallesTable />}
          {tab === 'users' && <AdminUsersTable />}
        </div>
      </div>
    </div>
  );
}

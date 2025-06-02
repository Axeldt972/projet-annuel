import React from 'react';

export default function Sidebar({ active }) {
  return (
    <aside className="h-screen w-60 bg-white shadow-lg flex flex-col">
      <div className="h-20 flex items-center justify-center border-b">
        <span className="text-2xl font-bold tracking-wide text-blue-700">Dashboard</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className={`flex items-center px-6 py-3 rounded-lg transition hover:bg-blue-50 text-gray-700 font-medium ${active==='dashboard' ? 'bg-blue-100 text-blue-700' : ''}`}>📊 <span className="ml-3">Accueil</span></a>
          </li>
          <li>
            <a href="/plan" className={`flex items-center px-6 py-3 rounded-lg transition hover:bg-blue-50 text-gray-700 font-medium ${active==='plan' ? 'bg-blue-100 text-blue-700' : ''}`}>🗺️ <span className="ml-3">Plan</span></a>
          </li>
          <li>
            <a href="/admin" className={`flex items-center px-6 py-3 rounded-lg transition hover:bg-blue-50 text-gray-700 font-medium ${active==='admin' ? 'bg-blue-100 text-blue-700' : ''}`}>👤 <span className="ml-3">Admin</span></a>
          </li>
          <li>
            <a href="/profil" className={`flex items-center px-6 py-3 rounded-lg transition hover:bg-blue-50 text-gray-700 font-medium ${active==='profil' ? 'bg-blue-100 text-blue-700' : ''}`}>⚙️ <span className="ml-3">Profil</span></a>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} - Projet Annuel</div>
    </aside>
  );
}

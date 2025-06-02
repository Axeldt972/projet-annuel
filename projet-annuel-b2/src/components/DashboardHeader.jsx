import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  console.log('[DEBUG HEADER] user =', user);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // Attendre que le user devienne null
      let tries = 0;
      while (tries < 20) { // max 2s
        await new Promise(res => setTimeout(res, 100));
        if (!window.localStorage.getItem('firebase:authUser')) break;
        tries++;
      }
      window.location.replace('/login');
    } catch (e) {
      alert('Erreur lors de la déconnexion.');
    }
    setLoading(false);
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b bg-white">
      <div className="text-xl font-semibold tracking-tight text-gray-800">Tableau de bord</div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 text-sm">{user?.email}</span>
        <a href="/profil" className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition">Profil</a>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              await logout();
              navigate('/login', { replace: true });
            } catch (e) {
              alert('Erreur lors de la déconnexion.');
            }
            setLoading(false);
          }}
          disabled={loading}
          className={
            `bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition flex items-center` +
            (loading ? ' opacity-60 cursor-not-allowed' : '')
          }
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          Déconnexion
        </button>
      </div>
    </header>
  );
}

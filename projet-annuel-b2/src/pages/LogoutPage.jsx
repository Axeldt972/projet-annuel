import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  useEffect(() => {
    let unmounted = false;
    const doLogout = async () => {
      try {
        await logout();
        if (!unmounted) window.location.replace('/login');
      } catch (e) {
        // Optionnel : afficher une erreur
        alert('Erreur lors de la déconnexion.');
      }
    };
    doLogout();
    return () => { unmounted = true; };
  }, [logout]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="mb-6">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
      <div className="text-xl font-semibold text-blue-900 mb-2">Déconnexion en cours...</div>
      <div className="text-gray-500 text-sm">Merci de votre visite, à bientôt !</div>
    </div>
  );
}

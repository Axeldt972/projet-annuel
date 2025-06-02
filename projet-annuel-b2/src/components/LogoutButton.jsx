import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      alert('Erreur lors de la déconnexion.');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        'ml-2 px-2 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400' +
        (loading ? ' opacity-60 cursor-not-allowed' : '')
      }
      aria-label="Se déconnecter"
    >
      {loading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  );
}

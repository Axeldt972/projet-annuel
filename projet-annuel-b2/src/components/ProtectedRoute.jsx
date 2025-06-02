import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useUserRole from '../hooks/useUserRole';

/**
 * @param {React.ReactNode} children
 * @param {string[]} roles autorisés (ex: ['admin', 'technique'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) return <div className="text-center mt-8">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center mt-16" aria-live="assertive">
        <div className="text-2xl font-bold text-red-700 mb-2">⛔ Accès interdit</div>
        <div className="text-gray-700 mb-2">Vous n'avez pas les droits nécessaires pour accéder à cette page.</div>
        <a href="/" className="text-blue-700 underline">Retour à l'accueil</a>
      </div>
    );
  }
  return children;
}

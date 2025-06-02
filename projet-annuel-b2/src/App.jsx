import React from 'react';
import { ToastProvider } from './components/ToastProvider';
import './App.css';
import AppRouter from './router';
import { useAuth } from './context/AuthContext';
import LogoutButton from './components/LogoutButton';
import useUserRole from './hooks/useUserRole';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, error: roleError } = useUserRole();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      setError(`${msg} at ${url}:${lineNo}:${columnNo} (${error && error.stack})`);
      return false;
    };
  }, []);

  return (
    <ToastProvider>
      <React.Fragment>
        <header className="w-full bg-gray-100 py-2 px-4 flex flex-col md:flex-row items-center justify-between mb-2 shadow">
          <div className="font-bold text-lg text-blue-900 mb-2 md:mb-0">CDP - Gestion des locaux</div>
          <nav className="flex flex-wrap gap-2 md:gap-4 items-center mb-2 md:mb-0" aria-label="Navigation principale">
            <a href="/signalement" className="text-blue-700 hover:underline font-medium" tabIndex={0}>Signalement</a>
            <a href="/plan" className="text-blue-700 hover:underline font-medium" tabIndex={0}>Plan</a>
            {(role === 'admin' || role === 'technique') && (
              <a href="/dashboard" className="text-blue-700 hover:underline font-medium" tabIndex={0}>Dashboard</a>
            )}
            {role === 'admin' && (
              <a href="/admin" className="text-blue-700 hover:underline font-medium" tabIndex={0}>Admin</a>
            )}
            {user && (
              <>
                <a href="/profil" className="text-blue-700 hover:underline font-medium" tabIndex={0}>Profil</a>
                <LogoutButton />
              </>
            )}
          </nav>
          {user && (
            <div className="text-sm text-gray-700 flex items-center gap-2">
              <span>Connecté :</span>
              <span className="font-semibold">{user.email}</span>
              <span className="px-2 py-1 rounded bg-blue-200 text-blue-800 uppercase text-xs">{role || '...'}</span>
            </div>
          )}
        </header>
        {(error || roleError) && (
          <div style={{ padding: 16, color: 'red', fontWeight: 'bold', fontSize: 16, background: '#fff3f3', border: '1px solid #f99', margin: '16px 0', borderRadius: 8 }}>
            {error && <><div>Erreur JS globale :</div><pre>{error}</pre></>}
            {roleError && <><div>Erreur Firestore :</div><pre>{roleError}</pre></>}
          </div>
        )}
        <main className="max-w-5xl mx-auto px-2 md:px-0">
          {(authLoading || roleLoading) ? (
            <div className="text-center mt-16 text-blue-800 font-semibold text-lg">Chargement de l'application...</div>
          ) : (
            <AppRouter />
          )}
        </main>
      </React.Fragment>
    </ToastProvider>
  );
}

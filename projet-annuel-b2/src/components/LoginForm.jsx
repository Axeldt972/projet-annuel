import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError("Identifiants invalides ou accès refusé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Adresse email"
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        autoFocus
        aria-label="Adresse email"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        aria-label="Mot de passe"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={loading}
        aria-label="Se connecter"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      <div className="mt-4 text-gray-500 text-xs text-center">La création de compte est réservée à l'administrateur.</div>
    </form>
  );
}

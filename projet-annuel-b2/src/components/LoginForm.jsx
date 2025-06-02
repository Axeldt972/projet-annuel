import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import Input from './ui/Input';

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
    <form
      onSubmit={handleLogin}
      className="space-y-5 p-8 rounded-2xl border border-blue-100 bg-white/40 backdrop-blur-xl shadow-xl max-w-md mx-auto mt-8"
    >
      <Input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Adresse email"
        required
        autoFocus
        aria-label="Adresse email"
      />
      <Input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
        aria-label="Mot de passe"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600/80 hover:bg-blue-700/90 text-white rounded-lg font-semibold shadow transition disabled:opacity-50 backdrop-blur"
        disabled={loading}
        aria-label="Se connecter"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <div className="mt-2 text-red-600 text-sm text-center animate-fade-in">{error}</div>}
      <div className="mt-4 text-gray-500 text-xs text-center">La création de compte est réservée à l'administrateur.</div>
    </form>
  );
}

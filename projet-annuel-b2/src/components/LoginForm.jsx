import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginForm() {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email.endsWith('@e-cdp.com')) {
        setError('Accès réservé aux utilisateurs @e-cdp.com');
        await auth.signOut();
      }
    } catch (e) {
      setError("Erreur d'authentification");
    }
  };

  return (
    <div>
      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded" onClick={handleLogin}>
        Se connecter avec Google
      </button>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </div>
  );
}

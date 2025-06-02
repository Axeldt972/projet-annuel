import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      setError(null);
      return;
    }
    async function fetchRole() {
      setLoading(true);
      setError(null);
      try {
        const collections = ['utilisateurs', 'admin', 'etudiants', 'administration'];
        let found = false;
        for (let col of collections) {
          const ref = doc(db, col, user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setRole(snap.data().role);
            found = true;
            break;
          }
        }
        if (!found) setRole('utilisateur');
      } catch (e) {
        setRole('utilisateur');
        setError('Erreur Firestore : ' + (e && e.message ? e.message : e));
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, [user]);

  return { role, loading, error };
}




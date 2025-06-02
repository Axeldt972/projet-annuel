import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    async function fetchRole() {
      setLoading(true);
      try {
        const q = query(collection(db, 'utilisateurs'), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setRole(snap.docs[0].data().role);
        } else {
          setRole('utilisateur'); // Par défaut
        }
      } catch {
        setRole('utilisateur');
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, [user]);

  return { role, loading };
}

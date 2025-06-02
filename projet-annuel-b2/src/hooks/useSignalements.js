import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function useSignalements() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'signalements'), orderBy('date_signalement', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSignalements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { signalements, loading };
}

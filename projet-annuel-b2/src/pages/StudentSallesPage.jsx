import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import SalleCard from '../components/SalleCard';
import { useAuth } from '../context/AuthContext';
import useUserRole from '../hooks/useUserRole';

export default function StudentSallesPage() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSalles() {
      try {
        const snap = await getDocs(collection(db, 'salles'));
        setSalles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError('Erreur lors du chargement des salles');
      } finally {
        setLoading(false);
      }
    }
    fetchSalles();
  }, []);

  if (loading) return <div className="text-center py-16">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 py-16">{error}</div>;
  if (role !== 'utilisateur') return <div className="text-center py-16">Accès réservé aux étudiants.</div>;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl overflow-auto">
      <h1 className="text-3xl font-bold mt-8 mb-6 text-blue-900 drop-shadow">Toutes les salles de l'établissement</h1>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 pb-16">
        {salles.map(salle => (
          <SalleCard key={salle.id} salle={salle} />
        ))}
      </div>
    </div>
  );
}

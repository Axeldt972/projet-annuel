import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';

const PROBLEMES = [
  'Climatisation défectueuse',
  'Salle sale',
  'Mobilier manquant',
  'Lumière non fonctionnelle',
];

const SALLES_MOCK = [
  'A101', 'A102', 'B201', 'B202', 'C301', 'C302',
];

export default function SignalementForm() {
  const [salle, setSalle] = useState('');
  const [problemes, setProblemes] = useState([]);
  const [commentaire, setCommentaire] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const salleRef = useRef(null);

  useEffect(() => {
    if (salleRef.current) {
      salleRef.current.focus();
    }
  }, []);

  const [salles, setSalles] = useState(SALLES_MOCK);
  const [loadingSalles, setLoadingSalles] = useState(true);

  useEffect(() => {
    async function fetchSalles() {
      try {
        const snap = await getDocs(collection(db, 'salles'));
        if (!snap.empty) {
          setSalles(snap.docs.map(doc => doc.data().nom));
        }
      } catch (e) {
        // fallback sur mock
      } finally {
        setLoadingSalles(false);
      }
    }
    fetchSalles();
  }, []);

  const handleProblemeChange = (p) => {
    setProblemes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    setGlobalError(null);
    setLoading(true);
    if (!salle || problemes.length === 0) {
      showToast('Veuillez sélectionner une salle et au moins un problème.', 'error');
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, 'signalements'), {
        salle,
        problemes,
        commentaire,
        date_signalement: Timestamp.now(),
        statut: 'Nouveau',
        commentaire_tech: '',
        date_traitement: null,
      });
      showToast('Signalement envoyé avec succès', 'success');
      setSalle('');
      setProblemes([]);
      setCommentaire('');
    } catch (e) {
      showToast('Erreur lors de l\'envoi du signalement', 'error');
      setGlobalError("Une erreur est survenue lors de la connexion à la base de données. Merci de réessayer ou de contacter l'administrateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block font-semibold">Salle</label>
        <select
          id="salle"
          value={salle}
          onChange={e => setSalle(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
          ref={salleRef}
          aria-label="Sélectionnez une salle"
        >
          <option value="">-- Choisir une salle --</option>
          {salles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {loadingSalles && <div className="text-xs text-gray-400">Chargement des salles...</div>}
      </div>
      <div>
        <label className="block font-semibold">Problèmes</label>
        {PROBLEMES.map(p => (
          <div key={p} className="flex items-center">
            <input type="checkbox" checked={problemes.includes(p)} onChange={() => handleProblemeChange(p)} />
            <span className="ml-2">{p}</span>
          </div>
        ))}
      </div>
      <div>
        <label className="block font-semibold">Commentaire (optionnel)</label>
        <textarea className="w-full border rounded p-2" value={commentaire} onChange={e => setCommentaire(e.target.value)} />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-700 text-white font-semibold py-2 px-4 rounded hover:bg-blue-800 disabled:opacity-50"
        disabled={loading}
        aria-label="Envoyer le signalement"
      >
        Envoyer le signalement
      </button>
      {success && <div className="text-green-600">Signalement envoyé !</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}

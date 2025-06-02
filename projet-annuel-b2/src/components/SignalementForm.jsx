import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import Input from './ui/Input';
import Select from './ui/Select';
import Checkbox from './ui/Checkbox';
import Textarea from './ui/Textarea';

const PROBLEMES = [
  'Climatisation défectueuse',
  'Salle sale',
  'Mobilier manquant',
  'Lumière non fonctionnelle',
];

const SALLES_MOCK = [
  'A101', 'A102', 'B201', 'B202', 'C301', 'C302',
];

export default function SignalementForm({ initialSalle = '' }) {
  const [salle, setSalle] = useState(initialSalle);
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
      setError('Veuillez sélectionner une salle et au moins un problème.');
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
      setSuccess(true);
      setSalle('');
      setProblemes([]);
      setCommentaire('');
    } catch (e) {
      setError("Erreur lors de l'envoi du signalement.");
      setGlobalError("Une erreur est survenue lors de la connexion à la base de données. Merci de réessayer ou de contacter l'administrateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/60 to-blue-300/60 backdrop-blur-2xl">
    <form
      className="w-[600px] max-w-[90vw] space-y-8 p-12 rounded-3xl border border-blue-200 bg-white/60 shadow-2xl backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block font-semibold mb-1">Salle</label>
        <Select
          id="salle"
          value={salle}
          onChange={e => setSalle(e.target.value)}
          required
          ref={salleRef}
          aria-label="Sélectionnez une salle"
          disabled={!!initialSalle}
        >
          <option value="">-- Choisir une salle --</option>
          {salles.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        {loadingSalles && <div className="text-xs text-gray-400 mt-1">Chargement des salles...</div>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Problèmes</label>
        <div className="flex flex-wrap gap-4">
          {PROBLEMES.map(p => (
            <label key={p} className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg shadow-sm hover:bg-blue-50 transition cursor-pointer">
              <Checkbox checked={problemes.includes(p)} onChange={() => handleProblemeChange(p)} />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Commentaire (optionnel)</label>
        <Textarea
          className="min-h-[80px]"
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          placeholder="Ajoutez un commentaire..."
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-700/80 hover:bg-blue-800/90 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50 backdrop-blur"
        disabled={loading}
        aria-label="Envoyer le signalement"
      >
        {loading ? 'Envoi...' : 'Envoyer le signalement'}
      </button>
      {success && <div className="text-green-600 text-center animate-fade-in">Signalement envoyé !</div>}
      {error && <div className="text-red-600 text-center animate-fade-in">{error}</div>}
    </form>
    </div>
  );
}

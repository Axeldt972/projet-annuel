import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/ToastProvider';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { useAuth } from "../context/AuthContext";
import useUserRole from '../hooks/useUserRole';

function getInitials(nom, email) {
  if (nom && nom.trim().length > 0) {
    return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }
  return '?';
}

export default function ProfilPage() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { showToast } = useToast();

  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [creationDate, setCreationDate] = useState('');
  const nomRef = useRef(null);

  useEffect(() => {
    async function fetchNom() {
      if (user) {
        const snap = await getDoc(doc(db, 'utilisateurs', user.uid));
        setNom(snap.exists() ? snap.data().nom || '' : '');
        if (user.metadata && user.metadata.creationTime) {
          setCreationDate(new Date(user.metadata.creationTime).toLocaleString());
        }
      }
      setLoading(false);
    }
    fetchNom();
  }, [user]);

  const handleNomSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'utilisateurs', user.uid), { nom });
      showToast('Nom mis à jour', 'success');
    } catch (e) {
      showToast('Erreur lors de la mise à jour du nom', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pw1 || pw1 !== pw2) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    setPwSaving(true);
    try {
      await updatePassword(user, pw1);
      showToast('Mot de passe modifié', 'success');
      setPw1('');
      setPw2('');
    } catch (e) {
      showToast("Erreur lors du changement de mot de passe. Veuillez vous reconnecter.", 'error');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement du profil...</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-800 mb-2 border-4 border-blue-300"
          aria-label="Avatar utilisateur"
        >
          {getInitials(nom, user.email)}
        </div>
        <div className="text-lg font-semibold">{nom || user.email}</div>
        <div className="text-gray-600 text-sm">{user.email}</div>
        <div className="text-xs text-gray-400">UID : {user.uid}</div>
        {creationDate && <div className="text-xs text-gray-400">Compte créé le : {creationDate}</div>}
        <div className="text-xs text-blue-700 font-semibold mt-1">Rôle : {role}</div>
      </div>
      <form onSubmit={handleNomSubmit} className="mb-6">
        <label className="block font-semibold mb-1">Nom affiché</label>
        <input
          ref={nomRef}
          className="border rounded px-2 py-1 w-full mb-2"
          value={nom}
          onChange={e => setNom(e.target.value)}
          aria-label="Modifier le nom affiché"
        />
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded" disabled={saving} aria-label="Enregistrer le nom">Enregistrer</button>
      </form>
      <form onSubmit={handlePwSubmit}>
        <label className="block font-semibold mb-1">Changer le mot de passe</label>
        <input
          type="password"
          className="border rounded px-2 py-1 w-full mb-2"
          value={pw1}
          onChange={e => setPw1(e.target.value)}
          placeholder="Nouveau mot de passe"
          aria-label="Nouveau mot de passe"
        />
        <input
          type="password"
          className="border rounded px-2 py-1 w-full mb-2"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          placeholder="Confirmer le mot de passe"
          aria-label="Confirmer le mot de passe"
        />
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded" disabled={pwSaving} aria-label="Changer le mot de passe">Changer le mot de passe</button>
      </form>
      {/* Aucune option de suppression de compte n'est proposée */}
    </div>
  );
}

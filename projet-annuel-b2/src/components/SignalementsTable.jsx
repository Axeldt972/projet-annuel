import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import useSignalements from '../hooks/useSignalements';
import { db } from '../services/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

// Message d'erreur global Firestore
function GlobalError({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-800 text-center font-semibold" aria-live="assertive">
      {error}
    </div>
  );
}

// Fonction utilitaire pour exporter en CSV
function exportSignalementsToCSV(signalements, showToast) {
  try {
    if (!signalements || signalements.length === 0) throw new Error('Aucun signalement à exporter');
    const headers = [
      'ID', 'Salle', 'Problèmes', 'Commentaire', 'Statut', 'Date signalement', 'Date traitement', 'Commentaire technique'
    ];
    const rows = signalements.map(sig => [
      sig.id,
      sig.salle,
      Array.isArray(sig.problemes) ? sig.problemes.join(' | ') : sig.problemes,
      sig.commentaire || '',
      sig.statut,
      sig.date_signalement?.toDate ? sig.date_signalement.toDate().toLocaleString() : '',
      sig.date_traitement?.toDate ? sig.date_traitement.toDate().toLocaleString() : '',
      sig.commentaire_tech || ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'signalements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV réussi', 'success');
  } catch (e) {
    showToast('Erreur lors de l\'export CSV', 'error');
  }
}

export default function SignalementsTable() {
  const { signalements, loading } = useSignalements();
  const [editComment, setEditComment] = useState({});
  const [saving, setSaving] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const { showToast } = useToast();

  const updateStatut = async (id, statut) => {
    setSaving(s => ({ ...s, [id]: true }));
    setGlobalError(null);
    try {
      await updateDoc(doc(db, 'signalements', id), {
        statut,
        date_traitement: Timestamp.now(),
      });
      showToast('Statut mis à jour', 'success');
    } catch (e) {
      showToast('Erreur lors de la mise à jour du statut', 'error');
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const updateComment = async (id, commentaire_tech) => {
    setSaving(s => ({ ...s, [id]: true }));
    setGlobalError(null);
    try {
      await updateDoc(doc(db, 'signalements', id), {
        commentaire_tech,
        date_traitement: Timestamp.now(),
      });
      setEditComment(c => ({ ...c, [id]: undefined }));
    } catch (e) {
      setGlobalError("Erreur lors de la mise à jour du commentaire. Merci de réessayer ou de contacter l'administrateur.");
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  if (loading) return <div className="text-center py-8">Chargement des signalements...</div>;
  if (!signalements.length) return <div className="text-center py-8 text-gray-500">Aucun signalement pour le moment.</div>;

  return (
    <div className="overflow-x-auto">

      <div className="flex justify-end mb-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          aria-label="Exporter les signalements en CSV"
          onClick={() => exportSignalementsToCSV(signalements, showToast)}
          disabled={!signalements || signalements.length === 0}
        >
          Exporter CSV
        </button>
      </div>
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Salle</th>
            <th className="p-2">Problèmes</th>
            <th className="p-2">Commentaire</th>
            <th className="p-2">Date</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Commentaire tech</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {signalements.map(sig => (
            <tr key={sig.id} className="border-t">
              <td className="p-2 font-semibold">{sig.salle}</td>
              <td className="p-2">{Array.isArray(sig.problemes) ? sig.problemes.join(', ') : sig.problemes}</td>
              <td className="p-2">{sig.commentaire}</td>
              <td className="p-2">{sig.date_signalement && sig.date_signalement.toDate ? sig.date_signalement.toDate().toLocaleString() : ''}</td>
              <td className="p-2">
                <span className={
                  sig.statut === 'Nouveau' ? 'bg-red-200 text-red-700 px-2 py-1 rounded' :
                  sig.statut === 'En cours' ? 'bg-yellow-200 text-yellow-700 px-2 py-1 rounded' :
                  'bg-green-200 text-green-700 px-2 py-1 rounded'
                }>
                  {sig.statut}
                </span>
              </td>
              <td className="p-2">
                {editComment[sig.id] !== undefined ? (
                  <form onSubmit={e => { e.preventDefault(); updateComment(sig.id, editComment[sig.id]); }} className="flex gap-2">
                    <input
                      className="border rounded p-1 text-xs"
                      value={editComment[sig.id]}
                      onChange={e => setEditComment(c => ({ ...c, [sig.id]: e.target.value }))}
                      disabled={saving[sig.id]}
                    />
                    <button type="submit" className="text-xs px-2 py-1 bg-green-600 text-white rounded" disabled={saving[sig.id]} aria-label="Valider le commentaire technique">OK</button>
                    <button type="button" className="text-xs px-2 py-1 bg-gray-300 rounded" onClick={() => setEditComment(c => ({ ...c, [sig.id]: undefined }))} aria-label="Annuler la modification du commentaire technique">Annuler</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{sig.commentaire_tech}</span>
                    <button className="text-xs px-2 py-1 bg-yellow-600 text-white rounded" onClick={() => setEditComment(c => ({ ...c, [sig.id]: sig.commentaire_tech || '' }))}>
                      Éditer
                    </button>
                  </div>
                )}
              </td>
              <td className="p-2 flex flex-col gap-1">
                <button
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded mb-1"
                  disabled={sig.statut === 'En cours' || saving[sig.id]}
                  onClick={() => updateStatut(sig.id, 'En cours')}
                >En cours</button>
                <button
                  className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                  disabled={sig.statut === 'Résolu' || saving[sig.id]}
                  onClick={() => updateStatut(sig.id, 'Résolu')}
                >Résolu</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

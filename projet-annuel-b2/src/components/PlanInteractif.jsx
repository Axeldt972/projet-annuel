import React, { useState } from 'react';
import useSalles from '../hooks/useSalles';
import useSignalements from '../hooks/useSignalements';
import useUserRole from '../hooks/useUserRole';
import { db } from '../services/firebase';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { useToast } from './ToastProvider';
import { useAuth } from "../context/AuthContext";

// Pour la démo, on suppose que chaque salle a des coordonnées x/y en base (sinon à mocker)
function getSalleCoords(salle) {
  // fallback simple si pas de coords en base
  return { x: salle.x || Math.random() * 400, y: salle.y || Math.random() * 180 };
}

function getStatutCouleur(statut) {
  if (statut === 'Nouveau') return 'bg-red-500';
  if (statut === 'En cours') return 'bg-yellow-400';
  if (statut === 'Résolu') return 'bg-green-500';
  return 'bg-gray-400';
}

export default function PlanInteractif({ etage = 'RDC', filtreStatut = 'Tous', filtreProbleme = 'Tous' }) {
  const { salles, loading: loadingSalles } = useSalles();
  const { signalements, loading: loadingSig } = useSignalements();
  const [salleFocus, setSalleFocus] = useState(null);
  const { role } = useUserRole();
  const { showToast } = useToast();
  const [saving, setSaving] = useState({});
  const [editComment, setEditComment] = useState({});
  const { user: currentUser } = useAuth();

  // Salles de l'étage
  const sallesEtage = salles.filter(s => s.etage === etage);

  // Pour chaque salle, trouver les signalements associés ET filtrés
  const getSignalementsSalle = (nomSalle) =>
    signalements.filter(sig => {
      if (sig.salle !== nomSalle) return false;
      if (filtreStatut !== 'Tous' && sig.statut !== filtreStatut) return false;
      if (filtreProbleme !== 'Tous') {
        if (Array.isArray(sig.problemes)) {
          if (!sig.problemes.includes(filtreProbleme)) return false;
        } else if (sig.problemes !== filtreProbleme) {
          return false;
        }
      }
      // On n'affiche pas les signalements résolus sauf si filtreStatut = Résolu
      if (filtreStatut === 'Tous' && sig.statut === 'Résolu') return false;
      return true;
    });

  return (
    <div className="relative w-full max-w-2xl h-96 bg-gray-100 rounded shadow mb-4 overflow-hidden">
      {/* Fond SVG du plan (exemple schématique RDC) */}
      <svg
        viewBox="0 0 600 350"
        className="absolute left-0 top-0 w-full h-full"
        aria-label={`Plan schématique étage ${etage}`}
        focusable="false"
      >
        {/* Couloir */}
        <rect x="0" y="140" width="600" height="70" fill="#e5e7eb" />
        {/* Salles RDC (exemple) */}
        <rect x="50" y="50" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="100" y="100" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">A101</text>
        <rect x="200" y="50" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="250" y="100" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">A102</text>
        <rect x="400" y="50" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="450" y="100" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">B101</text>
        {/* Salles opposées */}
        <rect x="50" y="210" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="100" y="260" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">C101</text>
        <rect x="200" y="210" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="250" y="260" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">C102</text>
        <rect x="400" y="210" width="100" height="90" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="450" y="260" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#1e3a8a">D101</text>
      </svg>
      {/* Salles positionnées dynamiquement sur le SVG */}
      {sallesEtage.map(salle => {
        const coords = getSalleCoords(salle);
        // coords.x et coords.y doivent être dans l’espace [0,600]x[0,350] pour correspondre au SVG
        // Si pas de coords, fallback sur un mapping par nom (exemple)
        const nameToCoord = {
          'A101': { x: 100, y: 95 },
          'A102': { x: 250, y: 95 },
          'B101': { x: 450, y: 95 },
          'C101': { x: 100, y: 255 },
          'C102': { x: 250, y: 255 },
          'D101': { x: 450, y: 255 }
        };
        const pos = nameToCoord[salle.nom] || coords;
        const sigs = getSignalementsSalle(salle.nom);
        // Statut dominant (priorité : Nouveau > En cours)
        const statutDominant = sigs.find(s => s.statut === 'Nouveau')
          ? 'Nouveau'
          : sigs.find(s => s.statut === 'En cours')
          ? 'En cours'
          : sigs.length > 0
          ? sigs[0].statut
          : null;
        return (
          <button
            key={salle.id}
            className={`absolute px-2 py-1 rounded cursor-pointer font-semibold shadow-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 text-xs ${statutDominant ? getStatutCouleur(statutDominant) + ' text-white' : 'bg-gray-200 text-gray-800'}`}
            style={{ left: `calc(${pos.x}px - 30px)`, top: `calc(${pos.y}px - 15px)`, minWidth: 48, minHeight: 24, zIndex: 2 }}
            title={`Salle ${salle.nom}${statutDominant ? ' (' + statutDominant + ')' : ''}`}
            aria-label={`Salle ${salle.nom}${statutDominant ? ', signalement ' + statutDominant : ''}`}
            onClick={() => sigs.length > 0 && setSalleFocus({ salle, sigs })}
            tabIndex={0}
          >
            {salle.nom}
            {sigs.length > 0 && (
              <span className="ml-2 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center border border-white shadow-lg"
                style={{ background: statutDominant === 'Nouveau' ? '#ef4444' : statutDominant === 'En cours' ? '#facc15' : '#22c55e', color: '#fff' }}
                aria-label={`${sigs.length} signalement(s)`}
              >
                {sigs.length}
              </span>
            )}
          </button>
        );
      })}
      {/* Modale de détails signalements */}
      {salleFocus && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" tabIndex={-1} aria-modal="true" role="dialog">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setSalleFocus(null)} aria-label="Fermer">×</button>
            <h3 className="text-xl font-bold mb-2">Signalements pour la salle {salleFocus.salle.nom}</h3>
            {salleFocus.sigs.length === 0 ? (
              <div className="text-gray-500">Aucun signalement actif.</div>
            ) : (
              <ul className="space-y-2">
                {salleFocus.sigs.map(sig => (
                  <li key={sig.id} className="border-l-4 pl-2 py-1 mb-2" style={{ borderColor: statutDominant === 'Nouveau' ? '#ef4444' : statutDominant === 'En cours' ? '#facc15' : '#22c55e' }}>
                    <div className="font-semibold text-sm">{sig.problemes && sig.problemes.join ? sig.problemes.join(', ') : sig.problemes}</div>
                    <div className="text-xs text-gray-500">{sig.commentaire}</div>
                    <div className="text-xs">Statut : <span className="font-bold">{sig.statut}</span></div>
                    <div className="text-xs text-gray-400">Signalé le {sig.date_signalement?.toDate ? sig.date_signalement.toDate().toLocaleString() : ''}</div>
                    {/* Actions admin/technique */}
                    {(role === 'admin' || role === 'technique') && (
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        <button
                          className="text-xs px-2 py-1 rounded bg-yellow-500 text-white font-semibold disabled:opacity-50"
                          disabled={sig.statut === 'En cours' || saving[sig.id]}
                          onClick={async () => {
                            setSaving(s => ({ ...s, [sig.id]: true }));
                            try {
                              await updateDoc(doc(db, 'signalements', sig.id), {
                                statut: 'En cours',
                                date_traitement: Timestamp.now(),
                                historique: arrayUnion({
                                  action: 'Statut passé à En cours',
                                  user: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
                                  date: Timestamp.now(),
                                })
                              });
                              showToast('Statut mis à jour', 'success');
                            } catch {
                              showToast('Erreur lors de la mise à jour du statut', 'error');
                            } finally {
                              setSaving(s => ({ ...s, [sig.id]: false }));
                            }
                          }}
                          aria-label="Marquer en cours"
                        >En cours</button>
                        <button
                          className="text-xs px-2 py-1 rounded bg-green-600 text-white font-semibold disabled:opacity-50"
                          disabled={sig.statut === 'Résolu' || saving[sig.id]}
                          onClick={async () => {
                            setSaving(s => ({ ...s, [sig.id]: true }));
                            try {
                              await updateDoc(doc(db, 'signalements', sig.id), {
                                statut: 'Résolu',
                                date_traitement: Timestamp.now(),
                                historique: arrayUnion({
                                  action: 'Statut passé à Résolu',
                                  user: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
                                  date: Timestamp.now(),
                                })
                              });
                              showToast('Statut mis à jour', 'success');
                            } catch {
                              showToast('Erreur lors de la mise à jour du statut', 'error');
                            } finally {
                              setSaving(s => ({ ...s, [sig.id]: false }));
                            }
                          }}
                          aria-label="Marquer résolu"
                        >Résolu</button>
                        {/* Commentaire technique */}
                        {editComment[sig.id] !== undefined ? (
                          <form
                            onSubmit={async e => {
                              e.preventDefault();
                              setSaving(s => ({ ...s, [sig.id]: true }));
                              try {
                                await updateDoc(doc(db, 'signalements', sig.id), {
                                  commentaire_tech: editComment[sig.id],
                                  date_traitement: Timestamp.now(),
                                  historique: arrayUnion({
                                    action: 'Commentaire technique modifié',
                                    user: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
                                    date: Timestamp.now(),
                                    details: editComment[sig.id]
                                  })
                                });
                                showToast('Commentaire technique mis à jour', 'success');
                                setEditComment(c => ({ ...c, [sig.id]: undefined }));
                              } catch {
                                showToast('Erreur lors de la mise à jour du commentaire', 'error');
                              } finally {
                                setSaving(s => ({ ...s, [sig.id]: false }));
                              }
                            }}
                            className="flex gap-1 items-center"
                          >
                            <input
                              className="border rounded p-1 text-xs"
                              value={editComment[sig.id]}
                              onChange={e => setEditComment(c => ({ ...c, [sig.id]: e.target.value }))}
                              disabled={saving[sig.id]}
                              autoFocus
                              aria-label="Modifier le commentaire technique"
                            />
                            <button type="submit" className="text-xs px-2 py-1 bg-blue-600 text-white rounded" disabled={saving[sig.id]} aria-label="Valider le commentaire technique">OK</button>
                            <button type="button" className="text-xs px-2 py-1 bg-gray-300 rounded" onClick={() => setEditComment(c => ({ ...c, [sig.id]: undefined }))} aria-label="Annuler la modification du commentaire technique">Annuler</button>
                          </form>
                        ) : (
                          <>
                            <span className="text-xs text-gray-700 ml-2">Commentaire technique :</span>
                            <span className="text-xs text-gray-800 ml-1">{sig.commentaire_tech}</span>
                            <button
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded ml-2"
                              onClick={() => setEditComment(c => ({ ...c, [sig.id]: sig.commentaire_tech || '' }))}
                              aria-label="Éditer le commentaire technique"
                            >Éditer</button>
                          </>
                        )}
                      </div>
                    )}
                    {/* Historique des actions */}
                    {(role === 'admin' || role === 'technique') && Array.isArray(sig.historique) && sig.historique.length > 0 && (
                      <details className="mt-2 bg-gray-50 rounded p-2 text-xs" open={false}>
                        <summary className="font-semibold cursor-pointer">Historique des actions</summary>
                        <ul className="mt-1 space-y-1">
                          {[...sig.historique].sort((a, b) => b.date?.seconds - a.date?.seconds).map((h, i) => (
                            <li key={i} className="pl-2 border-l-2 border-blue-300">
                              <span className="font-bold">{h.action}</span> par <span className="italic">{h.user}</span>
                              {h.details && <span> — <span className="text-gray-700">{h.details}</span></span>}
                              <span className="text-gray-500 ml-2">{h.date?.toDate ? h.date.toDate().toLocaleString() : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {(loadingSalles || loadingSig) && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import PlanInteractif from '../components/PlanInteractif';
import useSignalements from '../hooks/useSignalements';
import { useToast } from '../components/ToastProvider';

const ETAGES = ['RDC', '1er'];
const STATUTS = ['Tous', 'Nouveau', 'En cours', 'Résolu'];

export default function PlanPage() {
  const [etage, setEtage] = useState('RDC');
  const [filtreStatut, setFiltreStatut] = useState('Tous');
  const [filtreProbleme, setFiltreProbleme] = useState('Tous');
  const { signalements } = useSignalements();
  const { showToast } = useToast();

  // Extraire dynamiquement tous les types de problèmes présents dans la base
  const allProblemes = useMemo(() => {
    const set = new Set();
    signalements.forEach(sig => {
      if (Array.isArray(sig.problemes)) sig.problemes.forEach(p => set.add(p));
      else if (sig.problemes) set.add(sig.problemes);
    });
    return ['Tous', ...Array.from(set)];
  }, [signalements]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Plan interactif du bâtiment</h1>
      <div className="mb-4 flex gap-4">
        {ETAGES.map(e => (
          <button
            key={e}
            onClick={() => setEtage(e)}
            className={`px-4 py-2 rounded ${etage === e ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <label className="font-semibold">Statut :</label>
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className="border rounded px-2 py-1">
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="font-semibold">Problème :</label>
        <select value={filtreProbleme} onChange={e => setFiltreProbleme(e.target.value)} className="border rounded px-2 py-1">
          {allProblemes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded shadow font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Exporter les signalements filtrés en CSV"
          onClick={() => {
            // Filtrage identique à PlanInteractif
            const filtered = signalements.filter(sig => {
              if (sig.etage !== etage) return false;
              if (filtreStatut !== 'Tous' && sig.statut !== filtreStatut) return false;
              if (filtreProbleme !== 'Tous') {
                if (Array.isArray(sig.problemes)) {
                  if (!sig.problemes.includes(filtreProbleme)) return false;
                } else if (sig.problemes !== filtreProbleme) {
                  return false;
                }
              }
              if (filtreStatut === 'Tous' && sig.statut === 'Résolu') return false;
              return true;
            });
            if (filtered.length === 0) {
              showToast('Aucun signalement à exporter', 'info');
              return;
            }
            const header = ['Salle','Problèmes','Commentaire','Statut','Commentaire technique','Date signalement','Date traitement'];
            const rows = filtered.map(sig => [
              sig.salle,
              Array.isArray(sig.problemes) ? sig.problemes.join(' / ') : sig.problemes,
              sig.commentaire || '',
              sig.statut,
              sig.commentaire_tech || '',
              sig.date_signalement?.toDate ? sig.date_signalement.toDate().toLocaleString() : '',
              sig.date_traitement?.toDate ? sig.date_traitement.toDate().toLocaleString() : '',
            ]);
            const csv = [header, ...rows].map(l => l.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0,10);
            a.download = `signalements_${etage}_${date}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Export CSV effectué', 'success');
          }}
        >Exporter CSV</button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <PlanInteractif etage={etage} filtreStatut={filtreStatut} filtreProbleme={filtreProbleme} />
      </div>
    </div>
  );
}

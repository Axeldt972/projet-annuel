import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastProvider';
import useSalles from '../hooks/useSalles';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const ETAGES = ['RDC', '1er'];

const EQUIPEMENTS_DEFAULT = {
  videoprojecteurs: 0,
  climatiseurs: 0,
  tables: 20,
  chaises: 20,
  tableau: 1
};

// Message d'erreur global Firestore
function GlobalError({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-800 text-center font-semibold" aria-live="assertive">
      {error}
    </div>
  );
}

// Fonction utilitaire pour exporter les salles en CSV
function exportSallesToCSV(salles, showToast) {
  try {
    if (!salles || salles.length === 0) throw new Error('Aucune salle à exporter');
    const headers = [
      'ID', 'Nom', 'Étage', 'Type'
    ];
    const rows = salles.map(salle => [
      salle.id,
      salle.nom,
      salle.etage,
      salle.type
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'salles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV réussi', 'success');
  } catch (e) {
    showToast('Erreur lors de l\'export CSV', 'error');
  }
}

export default function AdminSallesTable() {
  const { salles, loading } = useSalles();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nom: '', etage: 'RDC', equipements: { ...EQUIPEMENTS_DEFAULT }, proprete: 'propre' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('eq_')) {
      setForm(f => ({ ...f, equipements: { ...f.equipements, [name.slice(3)]: Number(value) } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEdit = (salle) => {
    setEditId(salle.id);
    setForm({
      nom: salle.nom,
      etage: salle.etage,
      equipements: { ...salle.equipements },
      proprete: salle.proprete
    });
  };

  const handleAdd = () => {
    setEditId('new');
    setForm({ nom: '', etage: 'RDC', equipements: { ...EQUIPEMENTS_DEFAULT }, proprete: 'propre' });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nom: '', etage: 'RDC', equipements: { ...EQUIPEMENTS_DEFAULT }, proprete: 'propre' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (editId === 'new') {
        await addDoc(collection(db, 'salles'), form);
        setMessage({ type: 'success', text: 'Salle ajoutée avec succès.' });
      } else {
        await updateDoc(doc(db, 'salles', editId), form);
        setMessage({ type: 'success', text: 'Salle modifiée avec succès.' });
      }
      const { showToast } = useToast();
      showToast('Salle ajoutée avec succès', 'success');
      handleCancel();
    } catch (e) {
      setMessage({ type: 'error', text: "Erreur lors de l'enregistrement." });
      setGlobalError("Erreur lors de l'enregistrement de la salle. Merci de réessayer ou de contacter l'administrateur.");
      const { showToast } = useToast();
      showToast('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette salle ?')) return;
    setMessage(null);
    try {
      await deleteDoc(doc(db, 'salles', id));
      setMessage({ type: 'success', text: 'Salle supprimée.' });
      const { showToast } = useToast();
      showToast('Salle supprimée avec succès', 'success');
    } catch (e) {
      setMessage({ type: 'error', text: "Erreur lors de la suppression." });
      setGlobalError("Erreur lors de la suppression de la salle. Merci de réessayer ou de contacter l'administrateur.");
      const { showToast } = useToast();
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement des salles...</div>;

  const { showToast } = useToast();
  return (
    <div className="overflow-x-auto">
      <GlobalError error={globalError} />
      <div className="flex justify-end mb-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          aria-label="Exporter les salles en CSV"
          onClick={() => exportSallesToCSV(salles, showToast)}
          disabled={!salles || salles.length === 0}
        >
          Exporter CSV
        </button>
      </div>

      <table className="min-w-full bg-white rounded shadow mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nom</th>
            <th className="p-2">Étage</th>
            <th className="p-2">Équipements</th>
            <th className="p-2">Propreté</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salles.map(salle => (
            editId === salle.id ? (
              <tr key={salle.id} className="border-t bg-yellow-50">
                <td className="p-2">
                  <input
                    type="text"
                    name="nom"
                    value={form.nom || ''}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                    required
                    ref={inputRef}
                  />
                </td>
                <td className="p-2">
                  <select name="etage" value={form.etage} onChange={handleChange} className="border rounded p-1">
                    {ETAGES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td className="p-2 text-xs">
                  VP: <input name="eq_videoprojecteurs" value={form.equipements.videoprojecteurs} onChange={handleChange} type="number" className="border w-10" />
                  Clim: <input name="eq_climatiseurs" value={form.equipements.climatiseurs} onChange={handleChange} type="number" className="border w-10" />
                  Tables: <input name="eq_tables" value={form.equipements.tables} onChange={handleChange} type="number" className="border w-10" />
                  Chaises: <input name="eq_chaises" value={form.equipements.chaises} onChange={handleChange} type="number" className="border w-10" />
                  Tableau: <input name="eq_tableau" value={form.equipements.tableau} onChange={handleChange} type="number" className="border w-10" />
                </td>
                <td className="p-2">
                  <select name="proprete" value={form.proprete} onChange={handleChange} className="border rounded p-1">
                    <option value="propre">propre</option>
                    <option value="sale">sale</option>
                  </select>
                </td>
                <td className="p-2">
                  <button onClick={handleSubmit} className="text-xs px-2 py-1 bg-green-600 text-white rounded mr-2" disabled={saving} aria-label="Valider">OK</button>
                  <button onClick={handleCancel} className="text-xs px-2 py-1 bg-gray-400 rounded" aria-label="Annuler">Annuler</button>
                </td>
              </tr>
            ) : (
              <tr key={salle.id} className="border-t">
                <td className="p-2 font-semibold">{salle.nom}</td>
                <td className="p-2">{salle.etage}</td>
                <td className="p-2 text-xs">
                  VP: {salle.equipements.videoprojecteurs}, Clim: {salle.equipements.climatiseurs}, Tables: {salle.equipements.tables}, Chaises: {salle.equipements.chaises}, Tableau: {salle.equipements.tableau}
                </td>
                <td className="p-2">
                  <span className={salle.proprete === 'propre' ? 'bg-green-200 text-green-700 px-2 py-1 rounded' : 'bg-red-200 text-red-700 px-2 py-1 rounded'}>
                    {salle.proprete}
                  </span>
                </td>
                <td className="p-2">
                  <button className="text-xs px-2 py-1 bg-yellow-600 text-white rounded mr-2" onClick={() => handleEdit(salle)} aria-label={`Éditer la salle ${salle.nom}`}>Éditer</button>
                  <button className="text-xs px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(salle.id)} aria-label={`Supprimer la salle ${salle.nom}`}>Supprimer</button>
                </td>
              </tr>
            )
          ))}
          {editId === 'new' && (
            <tr className="border-t bg-green-50">
              <td className="p-2">
                <input name="nom" value={form.nom} onChange={handleChange} className="border rounded p-1 w-20" />
              </td>
              <td className="p-2">
                <select name="etage" value={form.etage} onChange={handleChange} className="border rounded p-1">
                  {ETAGES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </td>
              <td className="p-2 text-xs">
                VP: <input name="eq_videoprojecteurs" value={form.equipements.videoprojecteurs} onChange={handleChange} type="number" className="border w-10" />
                Clim: <input name="eq_climatiseurs" value={form.equipements.climatiseurs} onChange={handleChange} type="number" className="border w-10" />
                Tables: <input name="eq_tables" value={form.equipements.tables} onChange={handleChange} type="number" className="border w-10" />
                Chaises: <input name="eq_chaises" value={form.equipements.chaises} onChange={handleChange} type="number" className="border w-10" />
                Tableau: <input name="eq_tableau" value={form.equipements.tableau} onChange={handleChange} type="number" className="border w-10" />
              </td>
              <td className="p-2">
                <select name="proprete" value={form.proprete} onChange={handleChange} className="border rounded p-1">
                  <option value="propre">propre</option>
                  <option value="sale">sale</option>
                </select>
              </td>
              <td className="p-2">
                <button onClick={handleSubmit} className="text-xs px-2 py-1 bg-green-600 text-white rounded mr-2" disabled={saving} aria-label="Valider">OK</button>
                <button onClick={handleCancel} className="text-xs px-2 py-1 bg-gray-400 rounded" aria-label="Annuler">Annuler</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {editId === null && (
        <button className="py-2 px-4 bg-blue-600 text-white rounded" onClick={handleAdd} aria-label="Ajouter une salle">Ajouter une salle</button>
      )}
    </div>
  );
}

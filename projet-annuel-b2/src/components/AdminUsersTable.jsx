import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastProvider';
import useUsers from '../hooks/useUsers';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const ROLES = ['admin', 'technique', 'utilisateur'];

// Message d'erreur global Firestore
function GlobalError({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-800 text-center font-semibold" aria-live="assertive">
      {error}
    </div>
  );
}

// Fonction utilitaire pour exporter les utilisateurs en CSV
function exportUsersToCSV(users, showToast) {
  try {
    if (!users || users.length === 0) throw new Error('Aucun utilisateur à exporter');
    const headers = [
      'ID', 'Email', 'Nom', 'Rôle'
    ];
    const rows = users.map(user => [
      user.id,
      user.email,
      user.nom,
      user.role
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'utilisateurs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV réussi', 'success');
  } catch (e) {
    showToast('Erreur lors de l\'export CSV', 'error');
  }
}

export default function AdminUsersTable() {
  const { users, loading } = useUsers();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ email: '', nom: '', role: 'utilisateur' });
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ email: user.email, nom: user.nom || '', role: user.role });
  };

  const handleAdd = () => {
    setEditId('new');
    setForm({ email: '', nom: '', role: 'utilisateur' });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ email: '', nom: '', role: 'utilisateur' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (editId === 'new') {
        await addDoc(collection(db, 'utilisateurs'), form);
        setMessage({ type: 'success', text: 'Utilisateur ajouté avec succès.' });
      } else {
        await updateDoc(doc(db, 'utilisateurs', editId), form);
        setMessage({ type: 'success', text: 'Utilisateur modifié avec succès.' });
      }
      handleCancel();
    } catch (e) {
      setMessage({ type: 'error', text: "Erreur lors de l'enregistrement." });
      setGlobalError("Erreur lors de l'enregistrement de l'utilisateur. Merci de réessayer ou de contacter l'administrateur.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setMessage(null);
    try {
      await deleteDoc(doc(db, 'utilisateurs', id));
      setMessage({ type: 'success', text: 'Utilisateur supprimé.' });
    } catch (e) {
      setMessage({ type: 'error', text: "Erreur lors de la suppression." });
      setGlobalError("Erreur lors de la suppression de l'utilisateur. Merci de réessayer ou de contacter l'administrateur.");
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement des utilisateurs...</div>;

  const { showToast } = useToast();
  return (
    <div className="overflow-x-auto">
      <GlobalError error={globalError} />
      <div className="flex justify-end mb-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          aria-label="Exporter les utilisateurs en CSV"
          onClick={() => exportUsersToCSV(users, showToast)}
          disabled={!users || users.length === 0}
        >
          Exporter CSV
        </button>
      </div>
      {message && (
        <div className={`mb-2 px-3 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <table className="min-w-full bg-white rounded shadow mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Nom</th>
            <th className="p-2">Rôle</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            editId === user.id ? (
              <tr key={user.id} className="border-t bg-yellow-50">
                <td className="p-2">
                  <input name="email" value={form.email} onChange={handleChange} className="border rounded p-1 w-40" />
                </td>
                <td className="p-2">
                  <input name="nom" value={form.nom} onChange={handleChange} className="border rounded p-1 w-32" />
                </td>
                <td className="p-2">
                  <select name="role" value={form.role} onChange={handleChange} className="border rounded p-1">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <button onClick={handleSubmit} className="text-xs px-2 py-1 bg-green-600 text-white rounded mr-2" disabled={saving} aria-label="Valider">OK</button>
                  <button onClick={handleCancel} className="text-xs px-2 py-1 bg-gray-400 rounded" aria-label="Annuler">Annuler</button>
                </td>
              </tr>
            ) : (
              <tr key={user.id} className="border-t">
                <td className="p-2 font-semibold">{user.email}</td>
                <td className="p-2">{user.nom}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <button className="text-xs px-2 py-1 bg-yellow-600 text-white rounded mr-2" onClick={() => handleEdit(user)} aria-label={`Éditer l'utilisateur ${user.email}`}>Éditer</button>
                  <button className="text-xs px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(user.id)} aria-label={`Supprimer l'utilisateur ${user.email}`}>Supprimer</button>
                </td>
              </tr>
            )
          ))}
          {editId === 'new' && (
            <tr className="border-t bg-green-50">
              <td className="p-2">
                <input name="email" value={form.email} onChange={handleChange} className="border rounded p-1 w-40" />
              </td>
              <td className="p-2">
                <input name="nom" value={form.nom} onChange={handleChange} className="border rounded p-1 w-32" />
              </td>
              <td className="p-2">
                <select name="role" value={form.role} onChange={handleChange} className="border rounded p-1">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td className="p-2">
                <button onClick={handleSubmit} className="text-xs px-2 py-1 bg-green-600 text-white rounded mr-2" disabled={saving} aria-label="Valider">OK</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button className="py-2 px-4 bg-blue-600 text-white rounded" onClick={handleAdd} aria-label="Ajouter un utilisateur">Ajouter un utilisateur</button>
    </div>
  );
}

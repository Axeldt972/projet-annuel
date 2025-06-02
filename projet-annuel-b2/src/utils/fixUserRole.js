// Script utilitaire à exécuter dans une page admin ou temporairement pour corriger le rôle d'un utilisateur dans Firestore
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Corrige le champ role d'un utilisateur dans la bonne collection Firestore
 * @param {string} uid - L'UID de l'utilisateur (copié depuis Firebase Auth)
 * @param {string} collection - Nom de la collection ('admin', 'etudiants', 'administration')
 * @param {string} nouveauRole - Le rôle à attribuer ('admin', 'etudiant', 'administration')
 */
export async function fixUserRole(uid, collection, nouveauRole) {
  try {
    const ref = doc(db, collection, uid);
    await updateDoc(ref, { role: nouveauRole });
    console.log(`✅ Rôle mis à jour pour ${uid} dans ${collection} : ${nouveauRole}`);
  } catch (e) {
    console.error('Erreur lors de la mise à jour du rôle :', e);
  }
}

// Exemple d'utilisation (à commenter ou supprimer après usage) :
// fixUserRole('VOTRE_UID_ICI', 'admin', 'admin');

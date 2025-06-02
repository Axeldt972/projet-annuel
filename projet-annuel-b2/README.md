# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Application de gestion des salles – CDP

## Structure du projet

- `src/components/` : composants réutilisables (formulaires, tableaux, plan interactif, etc.)
- `src/pages/` : pages principales (Signalement, Dashboard, Admin, Plan, Login)
- `src/services/` : intégration Firebase (auth, firestore)
- `src/hooks/` : hooks React custom (useAuth, etc.)
- `src/utils/` : fonctions utilitaires

## Installation & lancement

1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Ajouter la config Firebase dans `src/services/firebase.js` :
   ```js
   const firebaseConfig = {
     apiKey: "<TA_CLE_API>",
     authDomain: "<TON_DOMAINE>.firebaseapp.com",
     projectId: "<TON_PROJECT_ID>",
     storageBucket: "<TON_PROJECT_ID>.appspot.com",
     messagingSenderId: "<TON_MESSAGING_ID>",
     appId: "<TON_APP_ID>"
   };
   ```
4. Lancer l’application :
   ```bash
   npm run dev
   ```

## Fonctionnalités principales

- Signalement d’un problème en salle (formulaire)
- Visualisation et gestion des signalements en temps réel (dashboard technique)
- **Plan interactif des locaux avec filtres dynamiques, badges, modale détaillée, export CSV et accessibilité renforcée**
- Administration des salles et des utilisateurs (CRUD)
- Export CSV des signalements, salles et utilisateurs (admin/technique)
- Notifications toast accessibles (succès/erreur) pour toutes les actions importantes
- Authentification Google restreinte aux emails @e-cdp.com
- Sécurisation avancée via Firestore rules et gestion des rôles

---

## Plan interactif et gestion des signalements

- Affichage d’un plan SVG schématique de l’étage avec positionnement précis des salles
- Affichage dynamique des signalements sur le plan (badge coloré selon statut : Nouveau, En cours, Résolu)
- Filtres par étage, statut, type de problème
- Clic ou navigation clavier sur une salle : ouverture d’une modale listant les signalements actifs
- Export CSV direct des signalements filtrés depuis la vue plan
- **Accessibilité** : navigation clavier complète, aria-labels, focus visible, modale accessible, feedback toast annoncé

## Historique des actions et traçabilité

- Chaque signalement conserve un historique complet des actions (changement de statut, modification de commentaire technique)
- Historique visible dans la modale pour les rôles technique/admin, avec date, auteur, action, détails
- Traçabilité garantie pour toutes les interventions

## Checklist accessibilité

- Navigation clavier sur tout le site (Tab, Entrée, Échap, etc.)
- Focus visible sur tous les éléments interactifs
- aria-label explicite sur chaque bouton, champ, badge
- Notifications toast annoncées via aria-live
- Contraste couleurs respecté (badges, boutons, texte)
- Modale accessible au clavier et screen reader (aria-modal, role=dialog)
- Responsive mobile/tablette

## Tests à réaliser avant déploiement

- Tester chaque fonctionnalité avec chaque rôle (utilisateur, technique, admin)
- Créer/modifier/filtrer/exporter des signalements
- Changer statut/commentaire technique depuis la modale du plan
- Tester navigation clavier complète (tabulation, focus, fermeture modale)
- Vérifier l’export CSV avec différents filtres
- Vérifier le plan interactif sur mobile/tablette
- Vérifier la sécurité Firestore (accès interdit/autorisé selon le rôle)

---

## Gestion des rôles et administration

L’application gère 3 rôles principaux :

- **admin** : accès total (dashboard, admin, CRUD salles/utilisateurs, Firestore)
- **technique** : accès dashboard technique, gestion des signalements
- **utilisateur** : accès au signalement et au plan uniquement

### Attribution des rôles

Les rôles sont stockés dans la collection Firestore `utilisateurs` :
- **email** : adresse email (doit correspondre à l’auth Firebase)
- **nom** : nom affiché (optionnel)
- **role** : `admin`, `technique` ou `utilisateur`

Pour ajouter ou modifier un utilisateur/rôle :
1. Se connecter en tant qu’admin
2. Aller dans l’onglet “Admin” > “Utilisateurs”
3. Ajouter/modifier/supprimer un utilisateur (email + rôle)

⚠️ Seuls les admins peuvent accéder à l’admin et modifier les rôles.

### Sécurité Firestore (exemple de règles)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isCDPUser() {
      return request.auth != null && request.auth.token.email.matches('.*@e-cdp.com$');
    }
    function isAdmin() {
      return get(/databases/$(database)/documents/utilisateurs/$(request.auth.uid)).data.role == 'admin';
    }
    function isTech() {
      return get(/databases/$(database)/documents/utilisateurs/$(request.auth.uid)).data.role in ['admin', 'technique'];
    }

    match /signalements/{id} {
      allow read, create: if isCDPUser();
      allow update, delete: if isTech();
    }
    match /salles/{id} {
      allow read: if isCDPUser();
      allow write: if isAdmin();
    }
    match /utilisateurs/{id} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

- **Attention** : pour que les règles fonctionnent, l’UID du document utilisateur doit correspondre à l’UID Firebase de l’utilisateur (ou adapter la logique selon la clé utilisée).
- Adapter les règles selon la politique de sécurité souhaitée.

## Sécurité Firestore (exemple de règles)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Signalements
    match /signalements/{doc} {
      allow create: if request.auth != null && request.auth.token.email.matches('.*@e-cdp.com$');
      allow read: if request.auth != null && request.auth.token.email.matches('.*@e-cdp.com$');
      allow update, delete: if request.auth != null && (
        // Technicien ou admin
        request.auth.token.role in ['technique', 'admin']
      );
    }
    // Salles
    match /salles/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    // Utilisateurs
    match /utilisateurs/{doc} {
      allow read: if request.auth != null && request.auth.token.role == 'admin';
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```
> ⚠️ Pour une sécurité maximale, gère les rôles via custom claims Firebase Auth ou une collection Firestore `utilisateurs` synchronisée avec Auth.

## Accessibilité et expérience utilisateur

- Navigation clavier complète (tabIndex, aria-labels sur les boutons et liens)
- Feedbacks accessibles : tous les messages de succès/erreur sont annoncés via notifications toast (`aria-live`)
- Focus automatique sur les champs de formulaire
- UI responsive et adaptée mobile/desktop

## Déploiement (Firebase Hosting recommandé)

1. Installer les outils Firebase CLI :
   ```bash
   npm install -g firebase-tools
   ```
2. Se connecter à Firebase :
   ```bash
   firebase login
   ```
3. Initialiser l’hébergement dans le dossier du projet :
   ```bash
   firebase init hosting
   ```
   - Sélectionner le projet Firebase existant
   - Dossier public : `dist` (pour Vite)
   - Config “single-page app” : oui
4. Construire l’app pour la prod :
   ```bash
   npm run build
   ```
5. Déployer :
   ```bash
   firebase deploy
   ```

## Guide utilisateur

Voir le guide complet adapté à chaque rôle dans [`README_UTILISATEUR.md`](./README_UTILISATEUR.md)

## Conseils pour la suite

- Brancher tous les appels Firestore sur les composants (remplacer les mocks)
- Ajouter la gestion des rôles (admin, technique, utilisateur)
- Ajouter la gestion fine des équipements par salle
- Améliorer l’UX/UI (animations, feedbacks, accessibilité)
- Tester sur mobile et desktop

## Pour toute question ou évolution, voir la documentation dans chaque dossier (`README.md`).

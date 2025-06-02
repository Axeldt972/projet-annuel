// Configuration Firebase (à compléter avec tes propres clés)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "<TA_CLE_API>",
  authDomain: "<TON_DOMAINE>.firebaseapp.com",
  projectId: "<TON_PROJECT_ID>",
  storageBucket: "<TON_PROJECT_ID>.appspot.com",
  messagingSenderId: "<TON_MESSAGING_ID>",
  appId: "<TON_APP_ID>"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

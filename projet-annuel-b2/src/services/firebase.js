// Configuration Firebase (à compléter avec tes propres clés)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpFi-ZQdIwgmKXsKnTWDXTkDxDav-JVao",
  authDomain: "projet-annuel-8abed.firebaseapp.com",
  projectId: "projet-annuel-8abed",
  storageBucket: "projet-annuel-8abed.appspot.com",
  messagingSenderId: "1048629233978",
  appId: "1:1048629233978:web:5bad35142791408febe803",
  measurementId: "G-WVN14L5TNM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Analytics non utilisé dans l'app, à activer si besoin
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

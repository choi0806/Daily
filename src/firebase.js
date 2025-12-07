import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Read Vite env vars
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // initialization can fail in some environments if config is missing
  // caller should handle if `db` is undefined
  console.warn('Firebase init failed. Check environment variables.', e);
}

export const db = app ? getFirestore(app) : null;
export default app;

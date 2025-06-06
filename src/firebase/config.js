// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim()
};

// Initialize Firebase with retry logic
const initializeFirebase = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      // Enable offline persistence
      try {
        await enableIndexedDbPersistence(db);
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support offline persistence');
        }
      }

      return db;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Initialize and export
let dbPromise = initializeFirebase().catch(error => {
  console.error('Failed to initialize Firebase:', error.message);
  throw error;
});

export const getDb = async () => await dbPromise;
export { dbPromise as db }; 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase app
let app = null;
let db = null;

// Initialize Firestore with retry logic
const initializeFirestore = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!app) {
        app = initializeApp(firebaseConfig);
      }
      
      if (!db) {
        db = getFirestore(app);
        
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
      }

      return db;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error(`Failed to initialize Firestore after ${retries} attempts: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

export const getDb = async () => {
  if (!db) {
    db = await initializeFirestore();
  }
  return db;
};

export const getApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export default app; 
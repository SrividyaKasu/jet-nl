import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { getApp } from './config';

// Initialize auth with our Firebase app
const getFirebaseAuth = () => {
  const app = getApp();
  return getAuth(app);
};

// Google sign-in provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign in');
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign in successful:', result.user);
    return result.user;
  } catch (error) {
    console.error('Google sign in failed:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    console.log('Attempting sign out');
    const auth = getFirebaseAuth();
    await signOut(auth);
    console.log('Sign out successful');
  } catch (error) {
    console.error('Sign out failed:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Auth state change listener
export const onAuthChange = (callback) => {
  console.log('Setting up auth state change listener');
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    callback(user);
  });
}; 
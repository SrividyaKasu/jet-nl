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
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: result.user,
      token: await result.user.getIdToken()
    };
  } catch (error) {
    console.error('Google sign in failed:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
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

// Listen to auth state changes
export const onAuthChange = (callback) => {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Auth state change listener failed:', error);
    throw new Error(error.message || 'Failed to listen to auth changes');
  }
}; 
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import app from './config';

// Initialize auth with the existing Firebase app
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure additional Google OAuth scopes (optional)
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }
    };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    if (error.code === 'auth/configuration-not-found') {
      throw new Error('Google authentication is not properly configured. Please check your Firebase settings.');
    }
    throw new Error(error.message);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
        } else {
          resolve(null);
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

export { auth }; 
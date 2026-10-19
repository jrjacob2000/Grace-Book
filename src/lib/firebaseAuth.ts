import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, Auth } from 'firebase/auth';
import rawAppletConfig from '../../firebase-applet-config.json';
import { clearDriveCache } from './driveService';

const resolvedConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || rawAppletConfig.apiKey || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawAppletConfig.authDomain || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || rawAppletConfig.projectId || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawAppletConfig.storageBucket || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawAppletConfig.messagingSenderId || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || rawAppletConfig.appId || '').trim(),
  oAuthClientId: (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || rawAppletConfig.oAuthClientId || '').trim(),
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(resolvedConfig.apiKey && resolvedConfig.projectId);
};

let authInstance: Auth | null = null;

const getFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (authInstance) {
    return authInstance;
  }
  try {
    const app: FirebaseApp =
      getApps().length > 0 ? getApps()[0] : initializeApp(resolvedConfig);
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('Firebase Auth initialization skipped:', err);
    return null;
  }
};

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const activeAuth = getFirebaseAuth();
  if (!activeAuth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(activeAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      clearDriveCache();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const activeAuth = getFirebaseAuth();
  if (!activeAuth) {
    throw new Error(
      'Google Drive Cloud Sync is not configured in this build (VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are empty). For local dev, add them to .env.local; for GitHub Pages, add them to Repository Secrets and re-run the Deploy workflow.'
    );
  }

  try {
    isSigningIn = true;
    clearDriveCache();
    const result = await signInWithPopup(activeAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google Drive access token from sign-in');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    const code = error?.code || '';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.github.io';
    if (code === 'auth/unauthorized-domain') {
      throw new Error(
        `Domain "${host}" is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized domains and add "${host}".`
      );
    }
    if (code === 'auth/popup-blocked') {
      throw new Error(
        'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
      );
    }
    if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
      throw new Error(
        'Invalid Firebase API key. Check that VITE_FIREBASE_API_KEY in your GitHub Actions Secrets or .env.local matches your Firebase project.'
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessTokenInMemory = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  const activeAuth = getFirebaseAuth();
  if (activeAuth) {
    await activeAuth.signOut();
  }
  cachedAccessToken = null;
  clearDriveCache();
};


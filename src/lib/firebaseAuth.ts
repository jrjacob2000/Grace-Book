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
      'Google Drive Cloud Sync is not configured in this build (no VITE_FIREBASE_API_KEY set). You can use "Export JSON" and "Import Data" in the top bar for 100% offline local backups.'
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


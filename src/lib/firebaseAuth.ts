import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import rawAppletConfig from '../../firebase-applet-config.json';
import { clearDriveCache } from './driveService';

export type { User };

const cleanEnvValue = (val: string | undefined): string => {
  if (!val) return '';
  return val
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
};

const resolveConfigValue = (envVal: string | undefined, fallbackVal: string | undefined): string => {
  const cleanedEnv = cleanEnvValue(envVal);
  if (
    cleanedEnv &&
    cleanedEnv.toLowerCase() !== 'undefined' &&
    cleanedEnv.toLowerCase() !== 'null' &&
    !cleanedEnv.startsWith('YOUR_') &&
    !cleanedEnv.startsWith('MY_')
  ) {
    return cleanedEnv;
  }
  return cleanEnvValue(fallbackVal);
};

const rawProjectId = resolveConfigValue(
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  rawAppletConfig.projectId
);
const rawAuthDomain = resolveConfigValue(
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  rawAppletConfig.authDomain
);

// Always use <projectId>.firebaseapp.com if authDomain is empty or set to github.io
const normalizedAuthDomain =
  !rawAuthDomain || rawAuthDomain.endsWith('.github.io') || rawAuthDomain.includes('github.io/')
    ? rawProjectId
      ? `${rawProjectId}.firebaseapp.com`
      : ''
    : rawAuthDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

const resolvedConfig = {
  apiKey: resolveConfigValue(import.meta.env.VITE_FIREBASE_API_KEY, rawAppletConfig.apiKey),
  authDomain: normalizedAuthDomain,
  projectId: rawProjectId,
  storageBucket:
    resolveConfigValue(
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      rawAppletConfig.storageBucket
    ) || (rawProjectId ? `${rawProjectId}.firebasestorage.app` : ''),
  messagingSenderId: resolveConfigValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    rawAppletConfig.messagingSenderId
  ),
  appId: resolveConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, rawAppletConfig.appId),
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

export const markNeedsDriveConsentPrompt = (_tokenToRevoke?: string | null) => {
  provider.setCustomParameters({
    prompt: 'consent',
  });
  cachedAccessToken = null;
  clearDriveCache();
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const activeAuth = getFirebaseAuth();
  if (!activeAuth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  // Handle returning from signInWithRedirect if redirect flow was used
  getRedirectResult(activeAuth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          if (onAuthSuccess) onAuthSuccess(result.user, cachedAccessToken);
        }
      }
    })
    .catch((err) => {
      console.warn('Redirect sign-in check:', err);
    });

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
      throw new Error('Failed to get Google Drive access token from sign-in.');
    }

    // Reset prompt back to select_account after successful sign-in
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    const code = error?.code || '';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.github.io';

    // If popup was blocked by browser and we are not inside an iframe, fall back to signInWithRedirect
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (code === 'auth/popup-blocked' && !isInIframe) {
      await signInWithRedirect(activeAuth, provider);
      return null;
    }

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
    if (
      code === 'auth/invalid-api-key' ||
      code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.'
    ) {
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

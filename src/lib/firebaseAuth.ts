import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import rawAppletConfig from '../../firebase-applet-config.json';
import { clearDriveCache } from './driveService';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

const cleanEnvValue = (val: string | undefined): string => {
  if (!val) return '';
  return val
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
};

const normalizeOAuthClientId = (raw: string): string => {
  const cleaned = cleanEnvValue(raw);
  if (!cleaned) return '';
  // If user pasted only the numeric-hash prefix (e.g. "123456789-abcdef"), append the standard domain
  if (/^\d+-[a-zA-Z0-9_]+$/.test(cleaned)) {
    return `${cleaned}.apps.googleusercontent.com`;
  }
  return cleaned;
};

const rawProjectId = cleanEnvValue(
  import.meta.env.VITE_FIREBASE_PROJECT_ID || rawAppletConfig.projectId
);
const rawAuthDomain = cleanEnvValue(
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawAppletConfig.authDomain
);

// GitHub Pages (*.github.io) does not host Firebase's /__/auth/handler endpoint.
// Always fall back to <projectId>.firebaseapp.com if authDomain is empty or set to github.io.
const normalizedAuthDomain =
  !rawAuthDomain || rawAuthDomain.endsWith('.github.io') || rawAuthDomain.includes('github.io/')
    ? rawProjectId
      ? `${rawProjectId}.firebaseapp.com`
      : ''
    : rawAuthDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

const resolvedConfig = {
  apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY || rawAppletConfig.apiKey),
  authDomain: normalizedAuthDomain,
  projectId: rawProjectId,
  storageBucket: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      rawAppletConfig.storageBucket ||
      (rawProjectId ? `${rawProjectId}.firebasestorage.app` : '')
  ),
  messagingSenderId: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawAppletConfig.messagingSenderId
  ),
  appId: cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID || rawAppletConfig.appId),
  oAuthClientId: normalizeOAuthClientId(
    import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || rawAppletConfig.oAuthClientId
  ),
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    (resolvedConfig.apiKey && resolvedConfig.projectId) || resolvedConfig.oAuthClientId
  );
};

let authInstance: Auth | null = null;

const getFirebaseAuth = (): Auth | null => {
  if (!resolvedConfig.apiKey || !resolvedConfig.projectId) {
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

const ensureGsiScriptLoaded = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.oauth2) {
          clearInterval(timer);
          resolve();
        } else if (attempts > 50) {
          clearInterval(timer);
          reject(new Error('Google Identity Services script timed out loading.'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  });
};

const fetchGoogleUserProfile = async (accessToken: string): Promise<User> => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch Google user profile.');
  }
  const profile = await res.json();
  return {
    uid: profile.sub || profile.email || 'google-user',
    email: profile.email || null,
    displayName: profile.name || profile.email || 'Google User',
    photoURL: profile.picture || null,
  } as User;
};

/**
 * Direct Google Identity Services (GIS) OAuth2 Token Flow.
 * Used when VITE_GOOGLE_OAUTH_CLIENT_ID is available so static hosts like GitHub Pages
 * (*.github.io) do not fail with Cross-Origin-Opener-Policy (COOP) window.closed blocks
 * or third-party storage partitioning across *.firebaseapp.com/__/auth/handler.
 */
const signInWithGoogleIdentityServices = async (
  clientId: string,
  activeAuth: Auth | null
): Promise<{ user: User; accessToken: string }> => {
  await ensureGsiScriptLoaded();

  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services is unavailable in this browser.');
  }

  const accessToken = await new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: [...SCOPES, 'openid', 'email', 'profile'].join(' '),
      prompt: 'select_account',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                'Google authorization did not return an access token.'
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => {
        if (err?.type === 'popup_closed') {
          reject(new Error('Sign-in popup was closed before completing authentication.'));
        } else if (err?.type === 'popup_failed_to_open') {
          reject(
            new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.')
          );
        } else {
          reject(new Error(err?.message || 'Google Sign-In popup failed.'));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });

  cachedAccessToken = accessToken;

  // Sign into Firebase Auth via direct REST credential (no popup / no COOP issue) if configured
  if (activeAuth) {
    try {
      const credential = GoogleAuthProvider.credential(null, accessToken);
      const userCred = await signInWithCredential(activeAuth, credential);
      return { user: userCred.user, accessToken };
    } catch (credErr) {
      console.warn('Firebase signInWithCredential skipped, falling back to Google userinfo:', credErr);
    }
  }

  const fallbackUser = await fetchGoogleUserProfile(accessToken);
  return { user: fallbackUser, accessToken };
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
  const hasOAuthClientId = Boolean(resolvedConfig.oAuthClientId);

  if (!activeAuth && !hasOAuthClientId) {
    throw new Error(
      'Google Drive Cloud Sync is not configured in this build (VITE_GOOGLE_OAUTH_CLIENT_ID and VITE_FIREBASE_API_KEY are empty). For local dev, add them to .env.local; for GitHub Pages, add them to Repository Secrets and re-run the Deploy workflow.'
    );
  }

  try {
    isSigningIn = true;
    clearDriveCache();

    // Prefer Google Identity Services (GIS) when VITE_GOOGLE_OAUTH_CLIENT_ID is present.
    // This avoids Firebase signInWithPopup's cross-origin hop through *.firebaseapp.com/__/auth/handler
    // which triggers Chrome's Cross-Origin-Opener-Policy (COOP) window.closed blocking on GitHub Pages.
    if (hasOAuthClientId) {
      return await signInWithGoogleIdentityServices(resolvedConfig.oAuthClientId, activeAuth);
    }

    if (!activeAuth) {
      throw new Error('Firebase Auth is not initialized.');
    }

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
  const tokenToRevoke = cachedAccessToken;
  const activeAuth = getFirebaseAuth();
  if (activeAuth) {
    await activeAuth.signOut();
  }
  if (tokenToRevoke && typeof window !== 'undefined' && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(tokenToRevoke, () => {});
    } catch {
      // Ignore revoke errors
    }
  }
  cachedAccessToken = null;
  clearDriveCache();
};


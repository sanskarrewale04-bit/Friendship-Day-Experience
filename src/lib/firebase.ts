import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import configJson from '../../firebase-applet-config.json';

function getEnv(key: string): string | undefined {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // Ignore error
  }
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || configJson.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || configJson.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || configJson.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || configJson.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || configJson.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || configJson.appId,
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || configJson.measurementId || ''
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestoreDatabaseId = getEnv('VITE_FIREBASE_DATABASE_ID') || configJson.firestoreDatabaseId;

export const db = firestoreDatabaseId && firestoreDatabaseId !== '(default)'
  ? initializeFirestore(app, {}, firestoreDatabaseId)
  : getFirestore(app);

export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;

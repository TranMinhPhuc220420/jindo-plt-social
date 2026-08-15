import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import type { Database } from 'firebase/database';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as
    string | undefined;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL as
    string | undefined;

export function isFirebaseConfigured(): boolean {
    return Boolean(projectId && apiKey && databaseURL);
}

export function getFirebaseApp(): FirebaseApp | null {
    if (!isFirebaseConfigured()) {
        return null;
    }

    if (getApps().length > 0) {
        return getApp();
    }

    return initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
}

export function getFirebaseAuth(): Auth | null {
    const app = getFirebaseApp();

    return app ? getAuth(app) : null;
}

export function getFirebaseDatabase(): Database | null {
    const app = getFirebaseApp();

    return app ? getDatabase(app) : null;
}

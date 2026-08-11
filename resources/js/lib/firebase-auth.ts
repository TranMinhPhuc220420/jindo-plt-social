import { signInWithCustomToken } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

function xsrfToken(): string | undefined {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : undefined;
}

let signInPromise: Promise<boolean> | null = null;

/**
 * Mint a Laravel custom token and sign into Firebase Auth (once per session).
 * Returns false when Firebase Admin is unavailable (HTTP 503) or sign-in fails.
 */
export async function ensureFirebaseSignedIn(): Promise<boolean> {
    if (!isFirebaseConfigured()) {
        return false;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
        return false;
    }

    if (auth.currentUser) {
        return true;
    }

    if (signInPromise) {
        return signInPromise;
    }

    signInPromise = (async (): Promise<boolean> => {
        try {
            const tokenHeader = xsrfToken();
            const response = await fetch('/firebase/token', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(tokenHeader ? { 'X-XSRF-TOKEN': tokenHeader } : {}),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                return false;
            }

            const body = (await response.json()) as { token?: string };

            if (!body.token) {
                return false;
            }

            await signInWithCustomToken(auth, body.token);

            return Boolean(auth.currentUser);
        } catch {
            return false;
        } finally {
            signInPromise = null;
        }
    })();

    return signInPromise;
}

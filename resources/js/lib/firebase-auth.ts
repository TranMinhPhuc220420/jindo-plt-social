import { signInWithCustomToken } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

function xsrfToken(): string | undefined {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : undefined;
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let signInPromise: Promise<boolean> | null = null;

async function mintAndSignIn(auth: Auth): Promise<'ok' | 'auth' | 'retry'> {
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

        if (response.status === 401 || response.status === 419) {
            console.warn(
                '[firebase-auth] /firebase/token failed',
                response.status,
            );

            return 'auth';
        }

        if (!response.ok) {
            console.warn(
                '[firebase-auth] /firebase/token failed',
                response.status,
            );

            return 'retry';
        }

        const body = (await response.json()) as { token?: string };

        if (!body.token) {
            console.warn('[firebase-auth] token missing in response');

            return 'retry';
        }

        await signInWithCustomToken(auth, body.token);

        return auth.currentUser ? 'ok' : 'retry';
    } catch (error) {
        console.warn('[firebase-auth] sign-in failed', error);

        return 'retry';
    }
}

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

    try {
        await auth.authStateReady();
    } catch (error) {
        console.warn('[firebase-auth] authStateReady failed', error);
    }

    if (auth.currentUser) {
        return true;
    }

    if (signInPromise) {
        return signInPromise;
    }

    signInPromise = (async (): Promise<boolean> => {
        const delays = [0, 400, 800];

        for (let attempt = 0; attempt < delays.length; attempt++) {
            if (delays[attempt] > 0) {
                await wait(delays[attempt]);
            }

            if (auth.currentUser) {
                return true;
            }

            const result = await mintAndSignIn(auth);

            if (result === 'ok') {
                return true;
            }

            if (result === 'auth') {
                return false;
            }
        }

        return false;
    })().finally(() => {
        signInPromise = null;
    });

    return signInPromise;
}

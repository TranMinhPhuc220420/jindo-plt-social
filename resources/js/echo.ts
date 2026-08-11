import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'> | null;
    }
}

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;

/**
 * Echo/Reverb client — only when VITE_REVERB_APP_KEY is set.
 * Production Firebase builds omit Reverb; instantiating Pusher without a key throws.
 */
const echo: Echo<'reverb'> | null = reverbKey
    ? (() => {
          window.Pusher = Pusher;

          const instance = new Echo({
              broadcaster: 'reverb',
              key: reverbKey,
              wsHost: import.meta.env.VITE_REVERB_HOST,
              wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
              wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
              forceTLS:
                  (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
              enabledTransports: ['ws', 'wss'],
              authEndpoint: '/broadcasting/auth',
          });

          window.Echo = instance;

          return instance;
      })()
    : null;

if (!echo) {
    window.Echo = null;
}

export default echo;

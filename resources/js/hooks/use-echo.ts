import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import echo from '@/echo';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

/**
 * Subscribe to the authenticated user's private notification channel.
 */
export function useEchoNotifications(
    onNotification: (payload: Record<string, unknown>) => void,
): void {
    const { auth } = usePage<PageProps>().props;
    const userId = auth.user?.id;

    useEffect(() => {
        if (!userId || !import.meta.env.VITE_REVERB_APP_KEY) {
            return;
        }

        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.notification((notification: Record<string, unknown>) => {
            onNotification(notification);
        });

        return () => {
            echo.leave(channelName);
        };
    }, [userId, onNotification]);
}

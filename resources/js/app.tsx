import { createInertiaApp, router } from '@inertiajs/react';
import { MotionProvider } from '@/components/motion/motion-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import echo from '@/echo';
import { initializeTheme } from '@/hooks/use-appearance';
import AppMessagesLayout from '@/layouts/app/app-messages-layout';
import AppProfileLayout from '@/layouts/app/app-profile-layout';
import AppSettingsLayout from '@/layouts/app/app-settings-layout';
import UnreadBadgesLayout from '@/layouts/app/unread-badges-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'PLT Social';

// So broadcast()->toOthers() can exclude this tab on Inertia form visits.
router.on('before', (event) => {
    const socketId = echo.socketId();

    if (socketId) {
        event.detail.visit.headers['X-Socket-ID'] = socketId;
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [UnreadBadgesLayout, AppSettingsLayout, SettingsLayout];
            case name.startsWith('messages/'):
                return [UnreadBadgesLayout, AppMessagesLayout];
            case name.startsWith('profile/'):
                return [UnreadBadgesLayout, AppProfileLayout];
            default:
                return [UnreadBadgesLayout, AppLayout];
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <MotionProvider>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </MotionProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();

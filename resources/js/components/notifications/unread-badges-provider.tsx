import { router, usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useEffectEvent,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import echo from '@/echo';
import type { AppNotification, Auth } from '@/types';

type PageProps = {
    auth: Auth;
    recent_notifications?: AppNotification[];
};

type UnreadBadgesValue = {
    notifications: number;
    messages: number;
    recent: AppNotification[];
    clearNotifications: () => void;
    markOneOptimistic: (id: string) => void;
    /** Authoritative message unread count (e.g. after opening a thread). */
    setMessages: (count: number) => void;
    /** Conversation the user is actively viewing — live bumps for it are ignored. */
    setActiveConversation: (conversationId: number | null) => void;
};

type Snapshot = {
    notifications: number;
    messages: number;
    recent: AppNotification[];
    serverNotifications: number;
    serverMessages: number;
    recentSig: string;
};

type SyncMode = 'full' | 'decrease-only';

const UnreadBadgesContext = createContext<UnreadBadgesValue | null>(null);

function recentSignature(items: AppNotification[]): string {
    return items.map((item) => `${item.id}:${item.read_at ?? ''}`).join('|');
}

function notificationFromEcho(
    payload: Record<string, unknown>,
): AppNotification {
    return {
        id: String(payload.id ?? crypto.randomUUID()),
        type: String(payload.type ?? 'notification'),
        data: payload as AppNotification['data'],
        read_at: null,
        created_at: new Date().toISOString(),
    };
}

function mergeRecentPreferringRead(
    local: AppNotification[],
    server: AppNotification[],
): AppNotification[] {
    const localById = new Map(local.map((item) => [item.id, item]));

    return server.map((item) => {
        const prev = localById.get(item.id);

        if (prev?.read_at && !item.read_at) {
            return { ...item, read_at: prev.read_at };
        }

        return item;
    });
}

/**
 * full — trust server (fresh network visit).
 * decrease-only — never inflate from stale history/prefetch; only lower a
 * counter when that specific shared prop decreased (keeps Echo bumps intact).
 */
function buildSnapshot(
    mode: SyncMode,
    current: Snapshot,
    serverNotifications: number,
    serverMessages: number,
    recent: AppNotification[],
    recentSig: string,
): Snapshot {
    if (mode === 'full') {
        return {
            notifications: serverNotifications,
            messages: serverMessages,
            recent,
            serverNotifications,
            serverMessages,
            recentSig,
        };
    }

    const nextNotifications =
        serverNotifications < current.serverNotifications
            ? Math.min(current.notifications, serverNotifications)
            : current.notifications;

    const nextMessages =
        serverMessages < current.serverMessages
            ? Math.min(current.messages, serverMessages)
            : current.messages;

    return {
        notifications: nextNotifications,
        messages: nextMessages,
        recent: mergeRecentPreferringRead(current.recent, recent),
        serverNotifications,
        serverMessages,
        recentSig,
    };
}

export function UnreadBadgesProvider({ children }: { children: ReactNode }) {
    const { auth, recent_notifications = [] } = usePage<PageProps>().props;
    const userId = auth.user?.id;

    const serverNotifications = auth.unread_notifications_count ?? 0;
    const serverMessages = auth.unread_messages_count ?? 0;
    const recentSig = recentSignature(recent_notifications);

    const sawNetworkSuccess = useRef(false);
    const activeConversationId = useRef<number | null>(null);
    const [pendingMode, setPendingMode] = useState<SyncMode | null>('full');

    const [snap, setSnap] = useState<Snapshot>(() => ({
        notifications: serverNotifications,
        messages: serverMessages,
        recent: recent_notifications,
        serverNotifications,
        serverMessages,
        recentSig,
    }));

    useEffect(() => {
        const offSuccess = router.on('success', () => {
            // Prefetch also fires success — navigate may downgrade to decrease-only.
            sawNetworkSuccess.current = true;
            setPendingMode('full');
        });

        const offNavigate = router.on('navigate', (event) => {
            if (event.detail.cached) {
                setPendingMode('decrease-only');
            } else if (!sawNetworkSuccess.current) {
                // Browser back/forward — no success event.
                setPendingMode('decrease-only');
            }

            sawNetworkSuccess.current = false;
        });

        return () => {
            offSuccess();
            offNavigate();
        };
    }, []);

    // Adjust local snapshot during render when Inertia asks us to sync, or when
    // shared props drift (optimistic updates).
    if (pendingMode !== null) {
        const mode = pendingMode;
        setPendingMode(null);

        setSnap((current) => {
            const next = buildSnapshot(
                mode,
                current,
                serverNotifications,
                serverMessages,
                recent_notifications,
                recentSig,
            );

            if (
                next.notifications === current.notifications &&
                next.messages === current.messages &&
                next.recentSig === current.recentSig &&
                next.serverNotifications === current.serverNotifications &&
                next.serverMessages === current.serverMessages
            ) {
                return current;
            }

            return next;
        });
    } else if (
        snap.serverNotifications !== serverNotifications ||
        snap.serverMessages !== serverMessages ||
        snap.recentSig !== recentSig
    ) {
        setSnap((current) =>
            buildSnapshot(
                'decrease-only',
                current,
                serverNotifications,
                serverMessages,
                recent_notifications,
                recentSig,
            ),
        );
    }

    const onNotification = useEffectEvent(
        (payload: Record<string, unknown>) => {
            setSnap((current) => ({
                ...current,
                notifications: current.notifications + 1,
                recent: [
                    notificationFromEcho(payload),
                    ...current.recent,
                ].slice(0, 8),
            }));
        },
    );

    const onUnreadBadges = useEffectEvent(
        (payload: {
            unread_messages_count?: number;
            unread_notifications_count?: number;
            conversation_id?: number;
        }) => {
            setSnap((current) => {
                let nextMessages = current.messages;

                if (typeof payload.unread_messages_count === 'number') {
                    const focused =
                        activeConversationId.current !== null &&
                        payload.conversation_id ===
                            activeConversationId.current;

                    // Viewing this thread — ignore live increases (mark-read
                    // will follow). Still apply decreases / other conversations.
                    if (
                        focused &&
                        payload.unread_messages_count > current.messages
                    ) {
                        nextMessages = current.messages;
                    } else {
                        nextMessages = payload.unread_messages_count;
                    }
                }

                return {
                    ...current,
                    messages: nextMessages,
                    notifications:
                        typeof payload.unread_notifications_count === 'number'
                            ? payload.unread_notifications_count
                            : current.notifications,
                };
            });
        },
    );

    useEffect(() => {
        if (!userId || !import.meta.env.VITE_REVERB_APP_KEY) {
            return;
        }

        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.notification((notification: Record<string, unknown>) => {
            onNotification(notification);
        });

        channel.listen(
            '.unread.badges',
            (payload: {
                unread_messages_count?: number;
                unread_notifications_count?: number;
                conversation_id?: number;
            }) => {
                onUnreadBadges(payload);
            },
        );

        return () => {
            echo.leave(channelName);
        };
    }, [userId]);

    const clearNotifications = useCallback(() => {
        setSnap((current) => ({
            ...current,
            notifications: 0,
            serverNotifications: 0,
            recent: current.recent.map((item) => ({
                ...item,
                read_at: item.read_at ?? new Date().toISOString(),
            })),
        }));
    }, []);

    const markOneOptimistic = useCallback((id: string) => {
        setSnap((current) => ({
            ...current,
            notifications: Math.max(0, current.notifications - 1),
            serverNotifications: Math.max(0, current.serverNotifications - 1),
            recent: current.recent.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          read_at: item.read_at ?? new Date().toISOString(),
                      }
                    : item,
            ),
        }));
    }, []);

    const setMessages = useCallback((count: number) => {
        const next = Math.max(0, count);
        setSnap((current) => ({
            ...current,
            messages: next,
            serverMessages: next,
        }));
    }, []);

    const setActiveConversation = useCallback(
        (conversationId: number | null) => {
            activeConversationId.current = conversationId;
        },
        [],
    );

    const value = useMemo(
        () => ({
            notifications: snap.notifications,
            messages: snap.messages,
            recent: snap.recent,
            clearNotifications,
            markOneOptimistic,
            setMessages,
            setActiveConversation,
        }),
        [
            snap.notifications,
            snap.messages,
            snap.recent,
            clearNotifications,
            markOneOptimistic,
            setMessages,
            setActiveConversation,
        ],
    );

    return (
        <UnreadBadgesContext.Provider value={value}>
            {children}
        </UnreadBadgesContext.Provider>
    );
}

export function useUnreadBadges(): UnreadBadgesValue {
    const value = useContext(UnreadBadgesContext);
    const { auth, recent_notifications = [] } = usePage<PageProps>().props;

    const fallback = useMemo<UnreadBadgesValue>(
        () => ({
            notifications: auth.unread_notifications_count ?? 0,
            messages: auth.unread_messages_count ?? 0,
            recent: recent_notifications,
            clearNotifications: () => undefined,
            markOneOptimistic: () => undefined,
            setMessages: () => undefined,
            setActiveConversation: () => undefined,
        }),
        [
            auth.unread_messages_count,
            auth.unread_notifications_count,
            recent_notifications,
        ],
    );

    return value ?? fallback;
}

/** Format badge digit with 9+ cap. */
export function formatBadgeCount(count: number): string {
    return count > 9 ? '9+' : String(count);
}

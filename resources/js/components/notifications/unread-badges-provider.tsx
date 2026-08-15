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
import { isFirebaseConfigured } from '@/lib/firebase';
import {
    inboxUnreadSum,
    isRealtimeEnabled,
    subscribeUserInbox,
    subscribeUserRealtime,
} from '@/lib/realtime';
import type { UnreadBadgesPayload } from '@/lib/realtime';
import type { AppNotification, Auth } from '@/types';

type PageProps = {
    auth: Auth;
    recent_notifications?: AppNotification[];
    realtime?: {
        driver?: string | null;
    };
};

type UnreadBadgesValue = {
    notifications: number;
    messages: number;
    recent: AppNotification[];
    clearNotifications: () => void;
    markOneOptimistic: (id: string) => void;
    /** Authoritative message unread count (e.g. after opening a thread). */
    setMessages: (count: number) => void;
    /** Conversation the user is actively viewing. */
    setActiveConversation: (conversationId: string | null) => void;
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

function semanticNotificationType(payload: Record<string, unknown>): string {
    const nested =
        payload.data && typeof payload.data === 'object'
            ? (payload.data as Record<string, unknown>)
            : null;
    const candidates = [payload.type, nested?.type];

    for (const value of candidates) {
        if (
            typeof value === 'string' &&
            value !== '' &&
            !value.includes('\\')
        ) {
            return value;
        }
    }

    const classType = typeof payload.type === 'string' ? payload.type : '';
    const fromClass: Record<string, string> = {
        'App\\Notifications\\PostLikedNotification': 'post_liked',
        'App\\Notifications\\CommentCreatedNotification': 'comment_created',
        'App\\Notifications\\UserFollowedNotification': 'user_followed',
        'App\\Notifications\\UserMentionedNotification': 'user_mentioned',
        'App\\Notifications\\PostSharedNotification': 'post_shared',
        'App\\Notifications\\PostModeratedNotification': 'post_moderated',
    };

    return fromClass[classType] ?? 'notification';
}

function notificationFromEcho(
    payload: Record<string, unknown>,
): AppNotification {
    const nested =
        payload.data &&
        typeof payload.data === 'object' &&
        !Array.isArray(payload.data)
            ? (payload.data as Record<string, unknown>)
            : payload;
    const kind = semanticNotificationType(payload);

    return {
        id: String(payload.id ?? nested.id ?? crypto.randomUUID()),
        type: kind,
        data: { ...nested, type: kind } as AppNotification['data'],
        read_at: null,
        created_at:
            typeof payload.created_at === 'string'
                ? payload.created_at
                : new Date().toISOString(),
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
 * full — first mount only (seed from Inertia).
 * decrease-only — never inflate from stale history/prefetch; keep live bumps.
 */
function buildSnapshot(
    mode: SyncMode,
    current: Snapshot,
    serverNotifications: number,
    _serverMessages: number,
    recent: AppNotification[],
    recentSig: string,
): Snapshot {
    if (mode === 'full') {
        return {
            notifications: serverNotifications,
            messages: current.messages,
            recent,
            serverNotifications,
            serverMessages: 0,
            recentSig,
        };
    }

    const nextNotifications =
        serverNotifications < current.serverNotifications
            ? Math.min(current.notifications, serverNotifications)
            : current.notifications;

    return {
        notifications: nextNotifications,
        messages: current.messages,
        recent: mergeRecentPreferringRead(current.recent, recent),
        serverNotifications,
        serverMessages: 0,
        recentSig,
    };
}

export function UnreadBadgesProvider({ children }: { children: ReactNode }) {
    const {
        auth,
        recent_notifications = [],
        realtime,
    } = usePage<PageProps>().props;
    const userId = auth.user?.id;
    const realtimeDriver = realtime?.driver ?? null;

    const serverNotifications = auth.unread_notifications_count ?? 0;
    const serverMessages = auth.unread_messages_count ?? 0;
    const recentSig = recentSignature(recent_notifications);

    const sawNetworkSuccess = useRef(false);
    const activeConversationId = useRef<string | null>(null);
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
            // Prefetch also fires success — never full-replace live Firebase/Echo bumps.
            sawNetworkSuccess.current = true;
            setPendingMode('decrease-only');
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
            setSnap((current) => {
                const incoming = notificationFromEcho(payload);

                if (current.recent.some((item) => item.id === incoming.id)) {
                    return current;
                }

                return {
                    ...current,
                    recent: [incoming, ...current.recent].slice(0, 8),
                };
            });
        },
    );

    const onUnreadBadges = useEffectEvent((payload: UnreadBadgesPayload) => {
        setSnap((current) => ({
            ...current,
            notifications:
                typeof payload.unread_notifications_count === 'number'
                    ? payload.unread_notifications_count
                    : current.notifications,
        }));
    });

    useEffect(() => {
        if (!userId || !isRealtimeEnabled(realtimeDriver)) {
            return;
        }

        return subscribeUserRealtime(
            userId,
            {
                onNotification,
                onUnreadBadges,
            },
            realtimeDriver,
        );
    }, [userId, realtimeDriver]);

    useEffect(() => {
        if (!userId || !isFirebaseConfigured()) {
            return;
        }

        return subscribeUserInbox(userId, (items) => {
            const sum = inboxUnreadSum(items);

            setSnap((current) =>
                current.messages === sum
                    ? current
                    : { ...current, messages: sum },
            );
        });
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
        (conversationId: string | null) => {
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

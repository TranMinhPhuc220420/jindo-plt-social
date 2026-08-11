import {
    onChildAdded,
    onChildRemoved,
    onValue,
    ref,
    remove,
    set,
} from 'firebase/database';
import type { Unsubscribe } from 'firebase/database';
import echo from '@/echo';
import { getFirebaseDatabase, isFirebaseConfigured } from '@/lib/firebase';
import { ensureFirebaseSignedIn } from '@/lib/firebase-auth';
import type { ChatMessage } from '@/types';

export type UnreadBadgesPayload = {
    unread_messages_count?: number;
    unread_notifications_count?: number;
    conversation_id?: number;
};

export type TypingPeerPayload = {
    id: number;
    name: string;
    username?: string;
};

export type UserRealtimeHandlers = {
    onNotification: (payload: Record<string, unknown>) => void;
    onUnreadBadges: (payload: UnreadBadgesPayload) => void;
};

export type ConversationRealtimeHandlers = {
    onMessage: (payload: ChatMessage) => void;
    onTyping: (peer: TypingPeerPayload) => void;
    onTypingStopped: (userId: number) => void;
    selfUserId?: number;
};

type MessageEvent = ChatMessage & { origin_user_id?: number };

function firebaseDriverEnabled(): boolean {
    return isFirebaseConfigured();
}

function echoDriverEnabled(): boolean {
    return Boolean(import.meta.env.VITE_REVERB_APP_KEY);
}

export function isRealtimeEnabled(): boolean {
    return firebaseDriverEnabled() || echoDriverEnabled();
}

/**
 * Subscribe to user-scoped notifications + badge counts.
 */
export function subscribeUserRealtime(
    userId: number,
    handlers: UserRealtimeHandlers,
): () => void {
    if (firebaseDriverEnabled()) {
        return subscribeUserFirebase(userId, handlers);
    }

    if (echoDriverEnabled()) {
        return subscribeUserEcho(userId, handlers);
    }

    return () => undefined;
}

/**
 * Subscribe to conversation messages + typing. Returns publishTyping helper.
 */
export function subscribeConversationRealtime(
    conversationId: number,
    handlers: ConversationRealtimeHandlers,
): {
    unsubscribe: () => void;
    publishTyping: (
        typing: boolean,
        user: { id: number; name: string },
    ) => void;
} {
    if (firebaseDriverEnabled()) {
        return subscribeConversationFirebase(conversationId, handlers);
    }

    if (echoDriverEnabled()) {
        return subscribeConversationEcho(conversationId, handlers);
    }

    return {
        unsubscribe: () => undefined,
        publishTyping: () => undefined,
    };
}

function subscribeUserEcho(
    userId: number,
    handlers: UserRealtimeHandlers,
): () => void {
    const channelName = `App.Models.User.${userId}`;
    const channel = echo.private(channelName);

    channel.notification((notification: Record<string, unknown>) => {
        handlers.onNotification(notification);
    });

    channel.listen('.unread.badges', (payload: UnreadBadgesPayload) => {
        handlers.onUnreadBadges(payload);
    });

    return () => {
        echo.leave(channelName);
    };
}

/**
 * Skip the first onValue snapshot (stale overwrite from before subscribe).
 */
function listenForNewValue(
    pathRef: ReturnType<typeof ref>,
    onNew: (value: unknown) => void,
): Unsubscribe {
    let skipInitial = true;

    return onValue(pathRef, (snapshot) => {
        if (skipInitial) {
            skipInitial = false;

            return;
        }

        const value = snapshot.val();

        if (value !== null && value !== undefined) {
            onNew(value);
        }
    });
}

function subscribeUserFirebase(
    userId: number,
    handlers: UserRealtimeHandlers,
): () => void {
    let cancelled = false;
    const unsubs: Unsubscribe[] = [];

    void (async () => {
        const signedIn = await ensureFirebaseSignedIn();
        const db = getFirebaseDatabase();

        if (cancelled || !signedIn || !db) {
            return;
        }

        const badgesRef = ref(db, `realtime/users/${userId}/badges`);
        unsubs.push(
            onValue(badgesRef, (snapshot) => {
                const value = snapshot.val() as UnreadBadgesPayload | null;

                if (value) {
                    handlers.onUnreadBadges(value);
                }
            }),
        );

        const notificationRef = ref(
            db,
            `realtime/users/${userId}/events/notification`,
        );
        unsubs.push(
            listenForNewValue(notificationRef, (value) => {
                const payload = value as Record<string, unknown>;
                handlers.onNotification({
                    id: payload.id,
                    ...payload,
                });
            }),
        );
    })();

    return () => {
        cancelled = true;
        unsubs.forEach((unsubscribe) => unsubscribe());
    };
}

function subscribeConversationEcho(
    conversationId: number,
    handlers: ConversationRealtimeHandlers,
): {
    unsubscribe: () => void;
    publishTyping: (
        typing: boolean,
        user: { id: number; name: string },
    ) => void;
} {
    const channelName = `conversation.${conversationId}`;
    const channel = echo.private(channelName);

    channel.listen('.message.sent', (payload: ChatMessage) => {
        if (
            handlers.selfUserId !== undefined &&
            payload.user.id === handlers.selfUserId
        ) {
            return;
        }

        handlers.onMessage(payload);
    });

    channel.listenForWhisper(
        'typing',
        (payload: {
            typing?: boolean;
            user_id?: number;
            user?: { id: number; name: string };
        }) => {
            const fromUser =
                payload.user ??
                (payload.user_id !== undefined
                    ? { id: payload.user_id, name: 'Someone' }
                    : null);

            if (!fromUser?.id) {
                return;
            }

            if (payload.typing === false) {
                handlers.onTypingStopped(fromUser.id);

                return;
            }

            handlers.onTyping({ id: fromUser.id, name: fromUser.name });
        },
    );

    channel.listen(
        '.user.typing',
        (payload: { user: { id: number; name: string } }) => {
            if (!payload.user?.id) {
                return;
            }

            handlers.onTyping({
                id: payload.user.id,
                name: payload.user.name,
            });
        },
    );

    return {
        unsubscribe: () => {
            echo.leave(channelName);
        },
        publishTyping: (typing, user) => {
            channel.whisper('typing', { typing, user });
        },
    };
}

function subscribeConversationFirebase(
    conversationId: number,
    handlers: ConversationRealtimeHandlers,
): {
    unsubscribe: () => void;
    publishTyping: (
        typing: boolean,
        user: { id: number; name: string },
    ) => void;
} {
    let cancelled = false;
    const unsubs: Unsubscribe[] = [];

    void (async () => {
        const signedIn = await ensureFirebaseSignedIn();
        const db = getFirebaseDatabase();

        if (cancelled || !signedIn || !db) {
            return;
        }

        const messageRef = ref(
            db,
            `realtime/conversations/${conversationId}/events/message`,
        );
        unsubs.push(
            listenForNewValue(messageRef, (raw) => {
                const value = raw as MessageEvent;

                if (!value?.user?.id) {
                    return;
                }

                if (
                    handlers.selfUserId !== undefined &&
                    (value.user.id === handlers.selfUserId ||
                        value.origin_user_id === handlers.selfUserId)
                ) {
                    return;
                }

                handlers.onMessage(value);
            }),
        );

        const typingRef = ref(
            db,
            `realtime/conversations/${conversationId}/typing`,
        );
        unsubs.push(
            onChildAdded(typingRef, (snapshot) => {
                const userId = Number(snapshot.key);
                const entry = snapshot.val() as {
                    name?: string;
                    username?: string;
                } | null;

                if (
                    !entry ||
                    Number.isNaN(userId) ||
                    handlers.selfUserId === userId
                ) {
                    return;
                }

                handlers.onTyping({
                    id: userId,
                    name: entry.name ?? 'Someone',
                    username: entry.username,
                });
            }),
        );
        unsubs.push(
            onChildRemoved(typingRef, (snapshot) => {
                const userId = Number(snapshot.key);

                if (!Number.isNaN(userId)) {
                    handlers.onTypingStopped(userId);
                }
            }),
        );
    })();

    return {
        unsubscribe: () => {
            cancelled = true;
            unsubs.forEach((unsubscribe) => unsubscribe());
        },
        publishTyping: (typing, user) => {
            void (async () => {
                const signedIn = await ensureFirebaseSignedIn();
                const db = getFirebaseDatabase();

                if (!signedIn || !db) {
                    return;
                }

                const typingRef = ref(
                    db,
                    `realtime/conversations/${conversationId}/typing/${user.id}`,
                );

                if (!typing) {
                    await remove(typingRef);

                    return;
                }

                await set(typingRef, {
                    name: user.name,
                    at: Date.now(),
                });
            })();
        },
    };
}

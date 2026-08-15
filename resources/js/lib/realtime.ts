import {
    increment,
    limitToLast,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    onValue,
    push,
    query,
    ref,
    remove,
    set,
    update,
} from 'firebase/database';
import type { DataSnapshot, Unsubscribe } from 'firebase/database';
import echo from '@/echo';
import { getFirebaseDatabase, isFirebaseConfigured } from '@/lib/firebase';
import { ensureFirebaseSignedIn } from '@/lib/firebase-auth';
import type {
    ChatMessage,
    ConversationSummary,
    MessageUser,
    SharedPost,
} from '@/types';

export type UnreadBadgesPayload = {
    unread_messages_count?: number;
    unread_notifications_count?: number;
    conversation_id?: string | number;
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
    onMessageRemoved?: (clientId: string) => void;
    onTyping: (peer: TypingPeerPayload) => void;
    onTypingStopped: (userId: number) => void;
    onPeerRead?: (at: number | null) => void;
    selfUserId?: number;
    peerUserId?: number;
};

export type RealtimeDriver = 'firebase' | 'reverb';

type MessageEvent = ChatMessage & {
    origin_user_id?: number;
    client_id?: string;
    mysql_id?: number;
};

export type LiveMessageDraft = {
    conversation_id: string;
    /** Pre-allocated push key so the optimistic bubble and the RTDB echo match. */
    client_id?: string | null;
    body: string | null;
    image_url?: string | null;
    shared_post?: SharedPost | null;
    created_at?: string | null;
    user: MessageUser;
    other_user: MessageUser;
};

/** How far back a first RTDB snapshot may be to still count as "live". */
const RECENT_EVENT_MS = 3000;

function firebaseDriverEnabled(): boolean {
    return isFirebaseConfigured();
}

function echoDriverEnabled(): boolean {
    return Boolean(import.meta.env.VITE_REVERB_APP_KEY);
}

/**
 * Pick the live driver from the server's BROADCAST_CONNECTION, not leftover Vite keys.
 * Notification badges follow this. DMs always use Firebase when configured.
 */
export function resolveRealtimeDriver(
    serverDriver?: string | null,
): RealtimeDriver | null {
    if (serverDriver === 'firebase' && firebaseDriverEnabled()) {
        return 'firebase';
    }

    if (serverDriver === 'reverb' && echoDriverEnabled()) {
        return 'reverb';
    }

    return null;
}

export function isRealtimeEnabled(serverDriver?: string | null): boolean {
    return resolveRealtimeDriver(serverDriver) !== null;
}

/** 1:1 chat is Firebase-only when client config is present. */
export function isFirebaseDmEnabled(): boolean {
    return isFirebaseConfigured();
}

/**
 * Subscribe to user-scoped notifications + badge counts.
 */
export function subscribeUserRealtime(
    userId: number,
    handlers: UserRealtimeHandlers,
    serverDriver?: string | null,
): () => void {
    const driver = resolveRealtimeDriver(serverDriver);

    if (driver === 'firebase') {
        return subscribeUserFirebase(userId, handlers);
    }

    if (driver === 'reverb') {
        return subscribeUserEcho(userId, handlers);
    }

    return () => undefined;
}

/**
 * Subscribe to conversation messages + typing. DMs use Firebase when configured.
 */
export function subscribeConversationRealtime(
    conversationId: string,
    handlers: ConversationRealtimeHandlers,
    serverDriver?: string | null,
): {
    unsubscribe: () => void;
    publishTyping: (
        typing: boolean,
        user: { id: number; name: string },
    ) => void;
} {
    if (isFirebaseDmEnabled()) {
        return subscribeConversationFirebase(conversationId, handlers);
    }

    const driver = resolveRealtimeDriver(serverDriver);

    if (driver === 'reverb') {
        return subscribeConversationEcho(conversationId, handlers);
    }

    return {
        unsubscribe: () => undefined,
        publishTyping: () => undefined,
    };
}

/**
 * `onInbox` always fires at least once (empty when RTDB is unreachable) so
 * callers can drop their loading state.
 */
export function subscribeUserInbox(
    userId: number,
    onInbox: (items: ConversationSummary[]) => void,
): () => void {
    let cancelled = false;
    const unsubs: Unsubscribe[] = [];

    void (async () => {
        const signedIn = await ensureFirebaseSignedIn();
        const db = getFirebaseDatabase();

        if (cancelled) {
            return;
        }

        if (!signedIn || !db) {
            onInbox([]);

            return;
        }

        unsubs.push(
            onValue(
                ref(db, `realtime/users/${userId}/inbox`),
                (snapshot) => {
                    onInbox(inboxFromSnapshot(snapshot));
                },
                (error) => {
                    console.warn('[realtime] inbox listen failed', error);
                    onInbox([]);
                },
            ),
        );
    })();

    return () => {
        cancelled = true;
        unsubs.forEach((unsubscribe) => unsubscribe());
    };
}

export function inboxUnreadSum(items: ConversationSummary[]): number {
    return items.reduce((sum, item) => sum + (item.unread_count ?? 0), 0);
}

function inboxFromSnapshot(snapshot: DataSnapshot): ConversationSummary[] {
    const raw = snapshot.val() as Record<string, unknown> | null;

    if (!raw || typeof raw !== 'object') {
        return [];
    }

    const items: ConversationSummary[] = [];

    for (const [cid, value] of Object.entries(raw)) {
        if (!value || typeof value !== 'object') {
            continue;
        }

        const row = value as {
            peer?: MessageUser;
            last_message?: { body?: string | null; created_at?: string | null };
            unread?: number;
            updated_at?: number;
        };

        items.push({
            id: cid,
            other_user: row.peer ?? null,
            last_message: row.last_message
                ? {
                      body: row.last_message.body ?? null,
                      created_at: row.last_message.created_at ?? null,
                  }
                : null,
            unread_count:
                typeof row.unread === 'number' ? Math.max(0, row.unread) : 0,
            updated_at: typeof row.updated_at === 'number' ? row.updated_at : 0,
        });
    }

    return items.sort((a, b) => (b.updated_at ?? 0) - (a.updated_at ?? 0));
}

function subscribeUserEcho(
    userId: number,
    handlers: UserRealtimeHandlers,
): () => void {
    if (!echo) {
        return () => undefined;
    }

    const client = echo;
    const channelName = `App.Models.User.${userId}`;
    const channel = client.private(channelName);

    channel.notification((notification: Record<string, unknown>) => {
        handlers.onNotification(notification);
    });

    channel.listen('.unread.badges', (payload: UnreadBadgesPayload) => {
        handlers.onUnreadBadges(payload);
    });

    return () => {
        client.leave(channelName);
    };
}

/**
 * Skip a stale overwrite snapshot, but keep events written in the last few
 * seconds (auth/subscribe race).
 */
function eventTimestampMs(value: unknown): number | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const record = value as Record<string, unknown>;

    if (typeof record.at === 'number') {
        return record.at;
    }

    if (typeof record.created_at === 'string') {
        const parsed = Date.parse(record.created_at);

        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
}

function listenForNewValue(
    pathRef: ReturnType<typeof ref>,
    onNew: (value: unknown) => void,
): Unsubscribe {
    let skipInitial = true;
    const subscribedAt = Date.now();

    return onValue(
        pathRef,
        (snapshot) => {
            const value = snapshot.val();

            if (skipInitial) {
                skipInitial = false;
                const at = eventTimestampMs(value);
                const isRecent =
                    at !== null && at >= subscribedAt - RECENT_EVENT_MS;

                if (!isRecent) {
                    return;
                }
            }

            if (value !== null && value !== undefined) {
                onNew(value);
            }
        },
        (error) => {
            console.warn(
                '[realtime] RTDB listen failed',
                pathRef.toString(),
                error,
            );
        },
    );
}

function liveMessageFromSnapshot(
    key: string,
    raw: unknown,
    selfUserId?: number,
): ChatMessage | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const value = raw as MessageEvent;

    if (!value.user?.id) {
        return null;
    }

    const clientId =
        typeof value.client_id === 'string' && value.client_id !== ''
            ? value.client_id
            : key;

    const conversationId =
        typeof value.conversation_id === 'string'
            ? value.conversation_id
            : undefined;

    return {
        id: clientId,
        client_id: clientId,
        conversation_id: conversationId,
        body: value.body ?? null,
        image_url: value.image_url ?? null,
        shared_post: value.shared_post ?? null,
        read_at: null,
        created_at: value.created_at ?? null,
        at: typeof value.at === 'number' ? value.at : undefined,
        user: value.user,
        is_mine: selfUserId !== undefined && value.user.id === selfUserId,
    };
}

/**
 * Reserve the push key before rendering the optimistic bubble. RTDB echoes a
 * local write before the server acks it, so the ids must match or the sender
 * sees the same message twice.
 */
export function allocateConversationMessageId(
    conversationId: string,
): string | null {
    const db = getFirebaseDatabase();

    if (!db) {
        return null;
    }

    return push(ref(db, `realtime/conversations/${conversationId}/messages`))
        .key;
}

/**
 * Write a DM + inbox rows. The browser is the only writer of these nodes.
 */
export async function publishLiveConversationMessage(
    draft: LiveMessageDraft,
): Promise<string | null> {
    const signedIn = await ensureFirebaseSignedIn();
    const db = getFirebaseDatabase();

    if (!signedIn || !db) {
        return null;
    }

    const conversationId = draft.conversation_id;
    const clientId =
        draft.client_id ??
        push(ref(db, `realtime/conversations/${conversationId}/messages`)).key;

    if (!clientId) {
        return null;
    }

    const createdAt = draft.created_at ?? new Date().toISOString();
    const snippet = liveMessageSnippet(draft);
    const at = Date.now();
    const selfId = draft.user.id;
    const peerId = draft.other_user.id;

    try {
        await update(ref(db, 'realtime'), {
            [`conversations/${conversationId}/messages/${clientId}`]: {
                client_id: clientId,
                conversation_id: conversationId,
                body: draft.body,
                image_url: draft.image_url ?? null,
                shared_post: draft.shared_post ?? null,
                created_at: createdAt,
                at,
                user: draft.user,
                origin_user_id: selfId,
            },
            [`conversations/${conversationId}/last_message`]: {
                body: snippet,
                created_at: createdAt,
                sender_id: selfId,
            },
            [`users/${selfId}/inbox/${conversationId}`]: {
                peer: draft.other_user,
                last_message: { body: snippet, created_at: createdAt },
                unread: 0,
                updated_at: at,
            },
            [`users/${peerId}/inbox/${conversationId}`]: {
                peer: draft.user,
                last_message: { body: snippet, created_at: createdAt },
                unread: increment(1),
                updated_at: at,
            },
        });
    } catch (error) {
        console.warn('[realtime] live message write failed', error);

        return null;
    }

    return clientId;
}

function liveMessageSnippet(draft: LiveMessageDraft): string | null {
    if (draft.body?.trim()) {
        return draft.body;
    }

    if (draft.shared_post) {
        return 'Shared a post';
    }

    if (draft.image_url) {
        return 'Photo';
    }

    return draft.body;
}

export async function markConversationRead(
    conversationId: string,
    selfUserId: number,
): Promise<void> {
    const signedIn = await ensureFirebaseSignedIn();
    const db = getFirebaseDatabase();

    if (!signedIn || !db) {
        return;
    }

    try {
        await update(ref(db, 'realtime'), {
            [`conversations/${conversationId}/read/${selfUserId}`]: {
                at: Date.now(),
            },
            [`users/${selfUserId}/inbox/${conversationId}/unread`]: 0,
        });
    } catch (error) {
        console.warn('[realtime] mark read failed', error);
    }
}

export async function removeLiveConversationMessage(
    conversationId: string,
    clientId: string,
): Promise<void> {
    const signedIn = await ensureFirebaseSignedIn();
    const db = getFirebaseDatabase();

    if (!signedIn || !db) {
        return;
    }

    try {
        await remove(
            ref(
                db,
                `realtime/conversations/${conversationId}/messages/${clientId}`,
            ),
        );
    } catch (error) {
        console.warn('[realtime] live message remove failed', error);
    }
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
            if (!cancelled && !signedIn) {
                console.warn(
                    '[realtime] user subscribe skipped — Firebase auth unavailable',
                    userId,
                );
            }

            return;
        }

        const badgesRef = ref(db, `realtime/users/${userId}/badges`);
        unsubs.push(
            onValue(
                badgesRef,
                (snapshot) => {
                    const value = snapshot.val() as UnreadBadgesPayload | null;

                    if (value) {
                        handlers.onUnreadBadges(value);
                    }
                },
                (error) => {
                    console.warn('[realtime] badges listen failed', error);
                },
            ),
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
    conversationId: string,
    handlers: ConversationRealtimeHandlers,
): {
    unsubscribe: () => void;
    publishTyping: (
        typing: boolean,
        user: { id: number; name: string },
    ) => void;
} {
    if (!echo) {
        return {
            unsubscribe: () => undefined,
            publishTyping: () => undefined,
        };
    }

    const client = echo;
    const channelName = `conversation.${conversationId}`;
    const channel = client.private(channelName);

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
            client.leave(channelName);
        },
        publishTyping: (typing, user) => {
            channel.whisper('typing', { typing, user });
        },
    };
}

function subscribeConversationFirebase(
    conversationId: string,
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
            if (!cancelled && !signedIn) {
                console.warn(
                    '[realtime] conversation subscribe skipped — Firebase auth unavailable',
                    conversationId,
                );
            }

            return;
        }

        const messagesRef = ref(
            db,
            `realtime/conversations/${conversationId}/messages`,
        );
        const messagesQuery = query(messagesRef, limitToLast(100));

        const handleLiveMessage = (snapshot: DataSnapshot) => {
            if (!snapshot.key) {
                return;
            }

            const message = liveMessageFromSnapshot(
                snapshot.key,
                snapshot.val(),
                handlers.selfUserId,
            );

            if (!message) {
                return;
            }

            handlers.onMessage(message);
        };

        unsubs.push(onChildAdded(messagesQuery, handleLiveMessage));
        unsubs.push(onChildChanged(messagesQuery, handleLiveMessage));
        unsubs.push(
            onChildRemoved(messagesQuery, (snapshot) => {
                const clientId = snapshot.key;

                if (clientId) {
                    handlers.onMessageRemoved?.(clientId);
                }
            }),
        );

        if (handlers.peerUserId !== undefined) {
            unsubs.push(
                onValue(
                    ref(
                        db,
                        `realtime/conversations/${conversationId}/read/${handlers.peerUserId}`,
                    ),
                    (snapshot) => {
                        const value = snapshot.val() as { at?: number } | null;
                        handlers.onPeerRead?.(
                            typeof value?.at === 'number' ? value.at : null,
                        );
                    },
                ),
            );
        }

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

import { usePage } from '@inertiajs/react';
import {
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from 'react';
import {
    isFirebaseDmEnabled,
    isRealtimeEnabled,
    subscribeConversationRealtime,
} from '@/lib/realtime';
import type { Auth, ChatMessage } from '@/types';

type PageProps = {
    auth: Auth;
    realtime?: {
        driver?: string | null;
    };
};

export type TypingPeer = {
    id: number;
    name: string;
};

type Options = {
    onMessage?: (payload: ChatMessage) => void;
    onMessageRemoved?: (clientId: string) => void;
    onPeerRead?: (at: number | null) => void;
    /** Used when a whisper only carries user_id (Reverb members mode). */
    peer?: TypingPeer | null;
};

/** How long after the last keystroke before we broadcast "stopped". */
const IDLE_STOP_MS = 1600;
/** Minimum gap between "still typing" heartbeats. */
const HEARTBEAT_MS = 2800;
/** Remote indicator expires if no heartbeat arrives. */
const REMOTE_EXPIRE_MS = 4000;

function xsrfToken(): string | undefined {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : undefined;
}

/**
 * Conversation realtime: messages + typing (Firebase RTDB or Echo/Reverb).
 * Typing prefers the live driver; falls back to POST when realtime is off.
 */
export function useConversationRealtime(
    conversationId: string,
    options: Options = {},
): {
    typingPeer: TypingPeer | null;
    setLocalTyping: (isTyping: boolean) => void;
    clearRemoteTyping: (userId?: number) => void;
} {
    const { auth, realtime } = usePage<PageProps>().props;
    const self = auth.user;
    const realtimeDriver = realtime?.driver ?? null;
    const peer = options.peer ?? null;
    const onMessage = useEffectEvent((payload: ChatMessage) => {
        options.onMessage?.(payload);
    });
    const onMessageRemoved = useEffectEvent((clientId: string) => {
        options.onMessageRemoved?.(clientId);
    });
    const onPeerRead = useEffectEvent((at: number | null) => {
        options.onPeerRead?.(at);
    });

    const [typingPeer, setTypingPeer] = useState<TypingPeer | null>(null);

    const publishTypingRef = useRef<
        ((typing: boolean, user: { id: number; name: string }) => void) | null
    >(null);
    const localTypingRef = useRef(false);
    const lastSentAtRef = useRef(0);
    const idleStopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const remoteExpireTimeout = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const peerRef = useRef(peer);

    useEffect(() => {
        peerRef.current = peer;
    }, [peer]);

    const clearIdleStop = () => {
        if (idleStopTimeout.current) {
            clearTimeout(idleStopTimeout.current);
            idleStopTimeout.current = null;
        }
    };

    const clearRemoteExpire = () => {
        if (remoteExpireTimeout.current) {
            clearTimeout(remoteExpireTimeout.current);
            remoteExpireTimeout.current = null;
        }
    };

    const markRemoteTyping = useEffectEvent((peer: TypingPeer) => {
        if (peer.id === self?.id) {
            return;
        }

        setTypingPeer(peer);
        clearRemoteExpire();
        remoteExpireTimeout.current = setTimeout(() => {
            setTypingPeer((current) =>
                current?.id === peer.id ? null : current,
            );
        }, REMOTE_EXPIRE_MS);
    });

    const clearRemoteTyping = useCallback((userId?: number) => {
        clearRemoteExpire();
        setTypingPeer((current) => {
            if (!current) {
                return null;
            }

            if (userId !== undefined && current.id !== userId) {
                return current;
            }

            return null;
        });
    }, []);

    const publish = useCallback(
        (typing: boolean) => {
            const user = self ? { id: self.id, name: self.name } : undefined;

            const livePublish = publishTypingRef.current;

            if (livePublish && user && isRealtimeEnabled(realtimeDriver)) {
                livePublish(typing, user);

                return;
            }

            // Without realtime, only announce "started" — stop is local-only.
            if (!typing) {
                return;
            }

            const token = xsrfToken();

            void fetch(`/messages/${conversationId}/typing`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-XSRF-TOKEN': token } : {}),
                },
                credentials: 'same-origin',
            });
        },
        [conversationId, self, realtimeDriver],
    );

    const stopLocalTyping = useCallback(() => {
        clearIdleStop();

        if (!localTypingRef.current) {
            return;
        }

        localTypingRef.current = false;
        lastSentAtRef.current = 0;
        publish(false);
    }, [publish]);

    const setLocalTyping = useCallback(
        (isTyping: boolean) => {
            if (!isTyping) {
                stopLocalTyping();

                return;
            }

            const now = Date.now();
            const shouldSend =
                !localTypingRef.current ||
                now - lastSentAtRef.current >= HEARTBEAT_MS;

            localTypingRef.current = true;

            if (shouldSend) {
                lastSentAtRef.current = now;
                publish(true);
            }

            clearIdleStop();
            idleStopTimeout.current = setTimeout(() => {
                stopLocalTyping();
            }, IDLE_STOP_MS);
        },
        [publish, stopLocalTyping],
    );

    useEffect(() => {
        if (!isFirebaseDmEnabled() && !isRealtimeEnabled(realtimeDriver)) {
            publishTypingRef.current = null;

            return;
        }

        const { unsubscribe, publishTyping } = subscribeConversationRealtime(
            conversationId,
            {
                selfUserId: self?.id,
                peerUserId: peer?.id,
                onMessage: (payload) => {
                    clearRemoteTyping(payload.user.id);
                    onMessage(payload);
                },
                onMessageRemoved: (clientId) => {
                    onMessageRemoved(clientId);
                },
                onPeerRead: (at) => {
                    onPeerRead(at);
                },
                onTyping: (remote) => {
                    markRemoteTyping({ id: remote.id, name: remote.name });
                },
                onTypingStopped: (userId) => {
                    clearRemoteTyping(userId);
                },
            },
            realtimeDriver,
        );

        publishTypingRef.current = publishTyping;

        return () => {
            stopLocalTyping();
            clearRemoteExpire();
            publishTypingRef.current = null;
            unsubscribe();
            setTypingPeer(null);
        };
    }, [
        conversationId,
        clearRemoteTyping,
        stopLocalTyping,
        self?.id,
        peer?.id,
        realtimeDriver,
    ]);

    return {
        typingPeer,
        setLocalTyping,
        clearRemoteTyping,
    };
}

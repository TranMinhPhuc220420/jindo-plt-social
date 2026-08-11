import { usePage } from '@inertiajs/react';
import {
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from 'react';
import echo from '@/echo';
import type { Auth, ChatMessage } from '@/types';

type PageProps = {
    auth: Auth;
};

export type TypingPeer = {
    id: number;
    name: string;
};

type WhisperPayload = {
    typing?: boolean;
    user_id?: number;
    user?: {
        id: number;
        name: string;
    };
};

type Options = {
    onMessage?: (payload: ChatMessage) => void;
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
 * Conversation realtime: messages + typing on a single private channel.
 * Typing prefers Echo whisper (no HTTP); falls back to POST when Reverb is off.
 */
export function useConversationRealtime(
    conversationId: number,
    options: Options = {},
): {
    typingPeer: TypingPeer | null;
    setLocalTyping: (isTyping: boolean) => void;
    clearRemoteTyping: (userId?: number) => void;
} {
    const { auth } = usePage<PageProps>().props;
    const self = auth.user;
    const peer = options.peer ?? null;
    const onMessage = useEffectEvent((payload: ChatMessage) => {
        options.onMessage?.(payload);
    });

    const [typingPeer, setTypingPeer] = useState<TypingPeer | null>(null);

    const channelRef = useRef<ReturnType<typeof echo.private> | null>(null);
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
            const payload: WhisperPayload = {
                typing,
                user: self ? { id: self.id, name: self.name } : undefined,
            };

            const channel = channelRef.current;

            if (channel && import.meta.env.VITE_REVERB_APP_KEY) {
                channel.whisper('typing', payload);

                return;
            }

            // Without Reverb, only announce "started" — stop is local-only.
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
        [conversationId, self],
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
        if (!import.meta.env.VITE_REVERB_APP_KEY) {
            channelRef.current = null;

            return;
        }

        const channelName = `conversation.${conversationId}`;
        const channel = echo.private(channelName);
        channelRef.current = channel;

        channel.listen('.message.sent', (payload: ChatMessage) => {
            clearRemoteTyping(payload.user.id);
            onMessage(payload);
        });

        channel.listenForWhisper('typing', (payload: WhisperPayload) => {
            const fromUser =
                payload.user ??
                (payload.user_id !== undefined
                    ? {
                          id: payload.user_id,
                          name:
                              peerRef.current?.id === payload.user_id
                                  ? peerRef.current.name
                                  : 'Someone',
                      }
                    : null);

            if (!fromUser?.id) {
                return;
            }

            // Treat missing `typing` as started (legacy / filtered payloads).
            if (payload.typing === false) {
                clearRemoteTyping(fromUser.id);

                return;
            }

            markRemoteTyping({ id: fromUser.id, name: fromUser.name });
        });

        channel.listen(
            '.user.typing',
            (payload: { user: { id: number; name: string } }) => {
                if (!payload.user?.id) {
                    return;
                }

                markRemoteTyping({
                    id: payload.user.id,
                    name: payload.user.name,
                });
            },
        );

        return () => {
            stopLocalTyping();
            clearRemoteExpire();
            channelRef.current = null;
            echo.leave(channelName);
            setTypingPeer(null);
        };
    }, [conversationId, clearRemoteTyping, stopLocalTyping]);

    return {
        typingPeer,
        setLocalTyping,
        clearRemoteTyping,
    };
}

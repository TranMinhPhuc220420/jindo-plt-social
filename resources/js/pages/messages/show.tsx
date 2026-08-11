import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConversationInbox } from '@/components/messages/conversation-inbox';
import { MessageComposer } from '@/components/messages/message-composer';
import { MessageThread } from '@/components/messages/message-thread';
import { TypingIndicator } from '@/components/messages/typing-indicator';
import { useUnreadBadges } from '@/components/notifications/unread-badges-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversationRealtime } from '@/hooks/use-conversation-realtime';
import { useInitials } from '@/hooks/use-initials';
import { useVisualViewportBottomInset } from '@/hooks/use-visual-viewport';
import { cn } from '@/lib/utils';
import type {
    Auth,
    ChatMessage,
    ConversationSummary,
    MessageUser,
} from '@/types';

type Props = {
    conversation: {
        id: number;
        other_user: MessageUser | null;
    };
    messages: ChatMessage[];
    conversations?: ConversationSummary[];
};

type PageProps = {
    auth: Auth;
};

function snippetFor(message: ChatMessage): string {
    if (message.body?.trim()) {
        return message.body;
    }

    if (message.shared_post) {
        return 'Shared a post';
    }

    if (message.image_url) {
        return 'Photo';
    }

    return '';
}

type InboxPreview = {
    body: string | null;
    created_at: string | null;
    unread_count?: number;
};

function sortByLastMessage(
    items: ConversationSummary[],
): ConversationSummary[] {
    return [...items].sort((a, b) => {
        const aTime = a.last_message?.created_at
            ? new Date(a.last_message.created_at).getTime()
            : 0;
        const bTime = b.last_message?.created_at
            ? new Date(b.last_message.created_at).getTime()
            : 0;

        return bTime - aTime;
    });
}

export default function MessagesShow({
    conversation,
    messages: initialMessages,
    conversations: initialConversations = [],
}: Props) {
    const getInitials = useInitials();
    const keyboardInset = useVisualViewportBottomInset();
    const { auth } = usePage<PageProps>().props;
    const { setMessages, setActiveConversation } = useUnreadBadges();
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
    const [previewById, setPreviewById] = useState<
        Record<number, InboxPreview>
    >({});
    const [scrollToken, setScrollToken] = useState(0);
    const [activeConversationId, setActiveConversationId] = useState(
        conversation.id,
    );

    // Thread open marks DMs read server-side — pin the shared badge to that count
    // and drop any prefetched pages that still carry a stale unread total.
    useEffect(() => {
        setMessages(auth.unread_messages_count ?? 0);
        router.flushAll();
    }, [conversation.id, auth.unread_messages_count, setMessages]);

    useEffect(() => {
        setActiveConversation(conversation.id);

        return () => {
            setActiveConversation(null);
        };
    }, [conversation.id, setActiveConversation]);

    if (activeConversationId !== conversation.id) {
        setActiveConversationId(conversation.id);
        setLiveMessages([]);
        setPreviewById({});
    }

    const inbox = useMemo(() => {
        const merged = initialConversations.map((item) => {
            const override = previewById[item.id];

            if (!override) {
                return item;
            }

            const propTime = item.last_message?.created_at
                ? new Date(item.last_message.created_at).getTime()
                : 0;
            const overrideTime = override.created_at
                ? new Date(override.created_at).getTime()
                : 0;

            if (propTime >= overrideTime) {
                return item;
            }

            return {
                ...item,
                last_message: {
                    body: override.body,
                    created_at: override.created_at,
                },
                unread_count: override.unread_count ?? item.unread_count ?? 0,
            };
        });

        return sortByLastMessage(merged);
    }, [initialConversations, previewById]);

    const messages = [...initialMessages, ...liveMessages].filter(
        (message, index, all) =>
            all.findIndex((item) => item.id === message.id) === index,
    );

    const appendOrReplaceLive = (
        next: ChatMessage,
        replaceClientId?: number,
    ) => {
        setLiveMessages((current) => {
            const withoutDup = current.filter(
                (item) =>
                    item.id !== next.id &&
                    (replaceClientId === undefined ||
                        item.id !== replaceClientId),
            );

            if (
                initialMessages.some((item) => item.id === next.id) &&
                replaceClientId === undefined
            ) {
                return withoutDup;
            }

            return [...withoutDup, next];
        });
    };

    const bumpInboxPreview = (
        conversationId: number,
        body: string | null,
        createdAt: string | null,
        unreadIncrement = false,
    ) => {
        setPreviewById((current) => {
            const existing = current[conversationId];
            const baseUnread =
                existing?.unread_count ??
                initialConversations.find((item) => item.id === conversationId)
                    ?.unread_count ??
                0;

            return {
                ...current,
                [conversationId]: {
                    body,
                    created_at: createdAt,
                    unread_count: unreadIncrement ? baseUnread + 1 : 0,
                },
            };
        });
    };

    const markThreadRead = () => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        void fetch(`/messages/${conversation.id}/read`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
            },
            credentials: 'same-origin',
        })
            .then(async (response) => {
                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as {
                    unread_messages_count?: number;
                };

                if (typeof data.unread_messages_count === 'number') {
                    setMessages(data.unread_messages_count);
                }
            })
            .catch(() => {
                // Reverb/mark-read is best-effort while viewing the thread.
            });
    };

    const { typingPeer, setLocalTyping } = useConversationRealtime(
        conversation.id,
        {
            peer: conversation.other_user
                ? {
                      id: conversation.other_user.id,
                      name: conversation.other_user.name,
                  }
                : null,
            onMessage: (payload) => {
                const mine = payload.user.id === auth.user?.id;

                // Own sends are handled via optimistic + JSON confirm.
                if (mine) {
                    return;
                }

                appendOrReplaceLive({
                    ...payload,
                    is_mine: false,
                    read_at: new Date().toISOString(),
                });

                bumpInboxPreview(
                    conversation.id,
                    snippetFor(payload) || null,
                    payload.created_at,
                    false,
                );

                markThreadRead();
            },
        },
    );

    return (
        <>
            <Head
                title={
                    conversation.other_user
                        ? `Chat with ${conversation.other_user.name}`
                        : 'Messages'
                }
            />
            <div
                className={cn(
                    'flex h-full min-h-0 flex-1 overflow-hidden bg-card',
                    'max-md:rounded-none max-md:border-0 max-md:shadow-none',
                    'md:rounded-lg md:border md:shadow-xs',
                )}
                style={
                    keyboardInset > 0
                        ? { paddingBottom: keyboardInset }
                        : undefined
                }
            >
                <aside className="hidden w-80 shrink-0 flex-col border-r md:flex">
                    <ConversationInbox
                        conversations={inbox}
                        activeId={conversation.id}
                    />
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex h-14 shrink-0 items-center gap-1 border-b bg-card px-1 sm:gap-2 sm:px-3">
                        <Link
                            href="/messages?inbox=1"
                            aria-label="Back to inbox"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
                        >
                            <ChevronLeft className="size-6" aria-hidden />
                        </Link>
                        {conversation.other_user ? (
                            <Link
                                href={`/u/${conversation.other_user.username}`}
                                className="flex min-w-0 flex-1 items-center gap-3 px-1 py-1"
                            >
                                <Avatar className="size-9">
                                    <AvatarImage
                                        src={
                                            conversation.other_user.avatar ??
                                            undefined
                                        }
                                    />
                                    <AvatarFallback>
                                        {getInitials(
                                            conversation.other_user.name,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold hover:underline">
                                        {conversation.other_user.name}
                                    </p>
                                    {typingPeer ? (
                                        <TypingIndicator
                                            name={typingPeer.name}
                                            variant="status"
                                        />
                                    ) : (
                                        <p className="h-4 truncate text-xs text-muted-foreground">
                                            @{conversation.other_user.username}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <p className="px-2 font-semibold">Conversation</p>
                        )}
                    </div>

                    <MessageThread
                        key={conversation.id}
                        messages={messages}
                        scrollToken={scrollToken}
                        typingName={typingPeer?.name ?? null}
                    />
                    <MessageComposer
                        conversationId={conversation.id}
                        self={{
                            id: auth.user!.id,
                            name: auth.user!.name,
                            username: auth.user!.username,
                            avatar: auth.user!.avatar ?? null,
                        }}
                        onTypingChange={setLocalTyping}
                        onOptimistic={(message) => {
                            appendOrReplaceLive(message);
                            bumpInboxPreview(
                                conversation.id,
                                snippetFor(message) || null,
                                message.created_at,
                                false,
                            );
                        }}
                        onConfirmed={(message, clientId) => {
                            appendOrReplaceLive(message, clientId);
                            bumpInboxPreview(
                                conversation.id,
                                snippetFor(message) || null,
                                message.created_at,
                                false,
                            );
                            setScrollToken((n) => n + 1);
                        }}
                        onFailed={(clientId) => {
                            setLiveMessages((current) =>
                                current.filter((item) => item.id !== clientId),
                            );
                        }}
                        onSent={() => {
                            setLocalTyping(false);
                            setScrollToken((n) => n + 1);
                        }}
                    />
                </div>
            </div>
        </>
    );
}

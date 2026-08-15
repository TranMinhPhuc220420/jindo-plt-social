import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConversationInbox } from '@/components/messages/conversation-inbox';
import { MessageComposer } from '@/components/messages/message-composer';
import { MessageThread } from '@/components/messages/message-thread';
import { TypingIndicator } from '@/components/messages/typing-indicator';
import { useUnreadBadges } from '@/components/notifications/unread-badges-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversationRealtime } from '@/hooks/use-conversation-realtime';
import { useInbox } from '@/hooks/use-inbox';
import { useInitials } from '@/hooks/use-initials';
import { useVisualViewportBottomInset } from '@/hooks/use-visual-viewport';
import { markConversationRead } from '@/lib/realtime';
import { cn } from '@/lib/utils';
import type { Auth, ChatMessage, MessageUser } from '@/types';

type Props = {
    conversation: {
        id: string;
        other_user: MessageUser | null;
    };
    messages?: ChatMessage[];
};

type PageProps = {
    auth: Auth;
};

function isSameMessage(a: ChatMessage, b: ChatMessage): boolean {
    if (a.client_id && b.client_id && a.client_id === b.client_id) {
        return true;
    }

    return a.id === b.id;
}

function messageAt(message: ChatMessage): number {
    if (typeof message.at === 'number') {
        return message.at;
    }

    return message.created_at ? new Date(message.created_at).getTime() : 0;
}

export default function MessagesShow({ conversation }: Props) {
    const getInitials = useInitials();
    const keyboardInset = useVisualViewportBottomInset();
    const { auth } = usePage<PageProps>().props;
    const inbox = useInbox();
    const conversations = inbox.conversations;
    const { setActiveConversation } = useUnreadBadges();
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
    const [peerReadAt, setPeerReadAt] = useState<number | null>(null);
    const [scrollToken, setScrollToken] = useState(0);
    const [activeConversationId, setActiveConversationId] = useState(
        conversation.id,
    );

    useEffect(() => {
        setActiveConversation(conversation.id);

        return () => {
            setActiveConversation(null);
        };
    }, [conversation.id, setActiveConversation]);

    useEffect(() => {
        if (!auth.user?.id) {
            return;
        }

        void markConversationRead(conversation.id, auth.user.id);
    }, [conversation.id, auth.user?.id]);

    if (activeConversationId !== conversation.id) {
        setActiveConversationId(conversation.id);
        setLiveMessages([]);
        setPeerReadAt(null);
    }

    const messages = liveMessages.map((message) => {
        if (
            message.is_mine &&
            peerReadAt !== null &&
            messageAt(message) <= peerReadAt
        ) {
            return {
                ...message,
                read_at: new Date(peerReadAt).toISOString(),
            };
        }

        return message;
    });

    const appendOrReplaceLive = (
        next: ChatMessage,
        replaceClientId?: string,
    ) => {
        setLiveMessages((current) => {
            const matches = (item: ChatMessage) =>
                isSameMessage(item, next) ||
                (replaceClientId !== undefined &&
                    (item.id === replaceClientId ||
                        item.client_id === replaceClientId));

            const index = current.findIndex(matches);

            if (index === -1) {
                return [...current, next];
            }

            // Update in place so a confirmation never re-orders the thread.
            return current.reduce<ChatMessage[]>((acc, item, at) => {
                if (at === index) {
                    acc.push(next);
                } else if (!matches(item)) {
                    acc.push(item);
                }

                return acc;
            }, []);
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

                appendOrReplaceLive({
                    ...payload,
                    is_mine: mine,
                });

                if (!mine && auth.user?.id) {
                    void markConversationRead(conversation.id, auth.user.id);
                }
            },
            onMessageRemoved: (clientId) => {
                setLiveMessages((current) =>
                    current.filter(
                        (item) =>
                            item.client_id !== clientId && item.id !== clientId,
                    ),
                );
            },
            onPeerRead: (at) => {
                setPeerReadAt(at);
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
                        conversations={conversations}
                        loading={inbox.loading}
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
                    {conversation.other_user && auth.user ? (
                        <MessageComposer
                            conversationId={conversation.id}
                            otherUser={conversation.other_user}
                            self={{
                                id: auth.user.id,
                                name: auth.user.name,
                                username: auth.user.username,
                                avatar: auth.user.avatar ?? null,
                            }}
                            onTypingChange={setLocalTyping}
                            onOptimistic={(message) => {
                                appendOrReplaceLive(message);
                            }}
                            onConfirmed={(message, clientId) => {
                                appendOrReplaceLive(message, clientId);
                                setScrollToken((n) => n + 1);
                            }}
                            onFailed={(clientId) => {
                                setLiveMessages((current) =>
                                    current.filter(
                                        (item) =>
                                            item.id !== clientId &&
                                            item.client_id !== clientId,
                                    ),
                                );
                            }}
                            onSent={() => {
                                setLocalTyping(false);
                                setScrollToken((n) => n + 1);
                            }}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}

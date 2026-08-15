import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { ConversationInbox } from '@/components/messages/conversation-inbox';
import { NewMessageButton } from '@/components/messages/new-message-button';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import { useInbox } from '@/hooks/use-inbox';

export default function MessagesIndex() {
    const { conversations, loading } = useInbox();
    const { url } = usePage();
    const forceInbox = url.includes('inbox=1');
    const redirected = useRef(false);

    useEffect(() => {
        if (
            forceInbox ||
            loading ||
            redirected.current ||
            conversations.length === 0
        ) {
            return;
        }

        redirected.current = true;
        router.visit(`/messages/${conversations[0].id}`, { replace: true });
    }, [forceInbox, loading, conversations]);

    return (
        <>
            <Head title="Messages" />
            <div className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-xs md:max-w-none">
                <ConversationInbox
                    conversations={conversations}
                    loading={loading}
                    titleAs="h1"
                    emptyState={
                        <EmptyState
                            title="No conversations yet"
                            description="Message a mutual follower from their profile, or tap the compose button to start a chat."
                            action={
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <NewMessageButton label="New message" />
                                    <Button variant="outline" asChild>
                                        <Link href="/explore">Find people</Link>
                                    </Button>
                                </div>
                            }
                            className="flex-1 py-16"
                        />
                    }
                />
            </div>
        </>
    );
}

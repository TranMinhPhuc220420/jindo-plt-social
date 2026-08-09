import { Head, Link } from '@inertiajs/react';
import { ConversationInbox } from '@/components/messages/conversation-inbox';
import { NewMessageButton } from '@/components/messages/new-message-button';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { ConversationSummary } from '@/types';

type Props = {
    conversations: ConversationSummary[];
};

export default function MessagesIndex({ conversations }: Props) {
    return (
        <>
            <Head title="Messages" />
            <div className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-xs md:max-w-none">
                <ConversationInbox
                    conversations={conversations}
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

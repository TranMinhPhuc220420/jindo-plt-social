import { Check, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SharedPostEmbed } from '@/components/posts/shared-post-embed';
import { EmptyState } from '@/components/social/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { isFirebaseConfigured } from '@/lib/firebase';
import { publishLiveConversationMessage } from '@/lib/realtime';
import { cn } from '@/lib/utils';
import type { ChatMessage, SharedPost } from '@/types';

type Recipient = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    sharedPreview: SharedPost;
};

export function ShareToMessageDialog({
    open,
    onOpenChange,
    postId,
    sharedPreview,
}: Props) {
    const getInitials = useInitials();
    const [query, setQuery] = useState('');
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();
        const delay = query.trim() === '' ? 0 : 200;

        const timer = window.setTimeout(() => {
            void fetchRecipients(query, controller.signal)
                .then((data) => {
                    if (!controller.signal.aborted) {
                        setRecipients(data);
                    }
                })
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setRecipients([]);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });
        }, delay);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [query, open]);

    function toggleUsername(username: string): void {
        setSelected((current) => {
            if (current.includes(username)) {
                return current.filter((item) => item !== username);
            }

            if (current.length >= 10) {
                return current;
            }

            return [...current, username];
        });
    }

    async function handleSend(): Promise<void> {
        if (selected.length === 0 || sending) {
            return;
        }

        setSending(true);

        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        try {
            const response = await fetch(`/posts/${postId}/share-message`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(token) }
                        : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    usernames: selected,
                    body: note.trim() === '' ? null : note,
                }),
            });

            if (!response.ok) {
                toast.error('Could not send.');

                return;
            }

            const data = (await response.json()) as {
                conversations?: Array<{
                    id: string;
                    other_user: ChatMessage['user'];
                    body: string | null;
                    shared_post?: SharedPost | null;
                    created_at: string | null;
                    user: ChatMessage['user'];
                }>;
            };

            if (isFirebaseConfigured() && data.conversations) {
                await Promise.all(
                    data.conversations.map((row) =>
                        publishLiveConversationMessage({
                            conversation_id: row.id,
                            body: row.body,
                            shared_post: row.shared_post ?? sharedPreview,
                            created_at: row.created_at,
                            user: row.user,
                            other_user: row.other_user,
                        }),
                    ),
                );
            }

            toast.success('Post sent.');
            onOpenChange(false);
        } catch {
            toast.error('Could not send.');
        } finally {
            setSending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle>Send in Messages</DialogTitle>
                    <DialogDescription className="sr-only">
                        Share this post with mutual followers
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 overflow-y-auto p-4">
                    <SharedPostEmbed shared={sharedPreview} />

                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => {
                                setLoading(true);
                                setQuery(event.target.value);
                            }}
                            placeholder="Search friends"
                            className="pl-8"
                        />
                    </div>

                    <div className="min-h-40">
                        {loading && recipients.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : recipients.length === 0 ? (
                            <EmptyState
                                title="No mutual friends"
                                description="Follow each other to send messages."
                                className="py-8"
                            />
                        ) : (
                            <ul className="space-y-1">
                                {recipients.map((person) => {
                                    const isSelected = selected.includes(
                                        person.username,
                                    );

                                    return (
                                        <li key={person.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleUsername(
                                                        person.username,
                                                    )
                                                }
                                                className={cn(
                                                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted/60',
                                                    isSelected && 'bg-muted/80',
                                                )}
                                            >
                                                <Avatar className="size-9">
                                                    <AvatarImage
                                                        src={
                                                            person.avatar ??
                                                            undefined
                                                        }
                                                        alt={person.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            person.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold">
                                                        {person.name}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        @{person.username}
                                                    </span>
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex size-5 items-center justify-center rounded-full border',
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-muted-foreground/40',
                                                    )}
                                                >
                                                    {isSelected ? (
                                                        <Check className="size-3" />
                                                    ) : null}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        maxLength={2000}
                        rows={2}
                        placeholder="Write a message…"
                        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div className="flex justify-end border-t border-border px-4 py-3">
                    <Button
                        type="button"
                        disabled={selected.length === 0 || sending}
                        onClick={() => {
                            void handleSend();
                        }}
                        className="min-w-24"
                    >
                        {sending ? <Spinner /> : 'Send'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

async function fetchRecipients(
    query: string,
    signal: AbortSignal,
): Promise<Recipient[]> {
    const params = new URLSearchParams();

    if (query.trim() !== '') {
        params.set('q', query.trim());
    }

    const response = await fetch(`/share-recipients?${params.toString()}`, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        throw new Error('Failed to load recipients');
    }

    const json = (await response.json()) as { data: Recipient[] };

    return json.data ?? [];
}

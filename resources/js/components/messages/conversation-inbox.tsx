import { Link } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NewMessageButton } from '@/components/messages/new-message-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/types';

type Props = {
    conversations: ConversationSummary[];
    activeId?: number | null;
    className?: string;
    /** Page title — use h1 on inbox index, p on thread aside. */
    titleAs?: 'h1' | 'p';
    /** When the inbox has zero conversations, replace the list. */
    emptyState?: ReactNode;
};

/**
 * Shared Chats chrome: title + compose + pill search + conversation rows.
 * Used by `/messages?inbox=1` and the desktop thread aside.
 */
export function ConversationInbox({
    conversations,
    activeId = null,
    className,
    titleAs = 'p',
    emptyState,
}: Props) {
    const getInitials = useInitials();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return conversations;
        }

        return conversations.filter((item) => {
            const name = item.other_user?.name?.toLowerCase() ?? '';
            const username = item.other_user?.username?.toLowerCase() ?? '';
            const body = item.last_message?.body?.toLowerCase() ?? '';

            return name.includes(q) || username.includes(q) || body.includes(q);
        });
    }, [conversations, query]);

    const TitleTag = titleAs;
    const showEmpty = conversations.length === 0 && emptyState;

    return (
        <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
            <div className="shrink-0 space-y-2.5 border-b px-3 pt-3 pb-2.5">
                <div className="flex items-center justify-between gap-2">
                    <TitleTag
                        className={cn(
                            'min-w-0 truncate font-bold tracking-tight',
                            titleAs === 'h1' ? 'text-xl' : 'text-base',
                        )}
                    >
                        Chats
                    </TitleTag>
                    <NewMessageButton />
                </div>

                {!showEmpty ? (
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search chats"
                            aria-label="Search chats"
                            className={cn(
                                'h-10 w-full rounded-full border-0 bg-muted pr-10 pl-9 text-sm outline-none',
                                'placeholder:text-muted-foreground',
                                'focus-visible:ring-2 focus-visible:ring-ring',
                            )}
                        />
                        {query ? (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="size-3.5" aria-hidden />
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {showEmpty ? (
                emptyState
            ) : (
                <ul className="min-h-0 flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <li className="px-3 py-10 text-center text-sm text-muted-foreground">
                            {query.trim()
                                ? 'No chats match your search'
                                : 'No conversations yet'}
                        </li>
                    ) : (
                        filtered.map((item) => {
                            const unread = item.unread_count ?? 0;
                            const isActive = item.id === activeId;

                            return (
                                <li key={item.id}>
                                    <Link
                                        href={`/messages/${item.id}`}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60',
                                            isActive && 'bg-primary/10',
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="size-12 md:size-11">
                                                <AvatarImage
                                                    src={
                                                        item.other_user
                                                            ?.avatar ??
                                                        undefined
                                                    }
                                                    alt={
                                                        item.other_user?.name ??
                                                        ''
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        item.other_user?.name ??
                                                            '?',
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            {unread > 0 && !isActive ? (
                                                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                                    {unread > 9 ? '9+' : unread}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        'truncate text-sm',
                                                        unread > 0 && !isActive
                                                            ? 'font-bold'
                                                            : 'font-semibold',
                                                    )}
                                                >
                                                    {item.other_user?.name ??
                                                        'Conversation'}
                                                </p>
                                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                                    {relativeTime(
                                                        item.last_message
                                                            ?.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                className={cn(
                                                    'truncate text-sm md:text-xs',
                                                    unread > 0 && !isActive
                                                        ? 'font-medium text-foreground'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {item.last_message?.body ??
                                                    'No messages yet'}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}

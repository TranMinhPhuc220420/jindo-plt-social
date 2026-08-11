import { AtSign, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { ReactionIcon } from '@/components/posts/reaction-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { isReactionType } from '@/lib/reactions';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

type Props = {
    item: AppNotification;
    compact?: boolean;
    /** When set, the row is a clickable control. Omit inside DropdownMenuItem. */
    onOpen?: (item: AppNotification) => void;
};

function notificationBody(item: AppNotification): string {
    const body = item.data.body;

    if (typeof body === 'string' && body !== '') {
        return body;
    }

    const name = item.data.actor_name;
    const message = item.data.message;

    if (
        typeof name === 'string' &&
        typeof message === 'string' &&
        message.startsWith(`${name} `)
    ) {
        return message.slice(name.length + 1);
    }

    return typeof message === 'string' ? message : 'New notification';
}

function TypeBadge({ item }: { item: AppNotification }) {
    const type = item.data.type ?? item.type;
    const reaction =
        typeof item.data.reaction === 'string' ? item.data.reaction : null;

    if (type === 'post_liked' && isReactionType(reaction)) {
        return (
            <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-background">
                <ReactionIcon type={reaction} className="size-4" />
            </span>
        );
    }

    const Icon =
        type === 'user_followed'
            ? UserPlus
            : type === 'user_mentioned'
              ? AtSign
              : type === 'post_shared'
                ? Share2
                : MessageCircle;

    const tone =
        type === 'user_followed'
            ? 'bg-[#1877F2] text-white'
            : type === 'user_mentioned'
              ? 'bg-violet-600 text-white'
              : type === 'post_shared'
                ? 'bg-[#1877F2] text-white'
                : 'bg-emerald-600 text-white';

    return (
        <span
            className={cn(
                'absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full shadow-sm ring-2 ring-background',
                tone,
            )}
        >
            <Icon className="size-3" aria-hidden />
        </span>
    );
}

export function NotificationItem({ item, compact = false, onOpen }: Props) {
    const getInitials = useInitials();
    const unread = !item.read_at;
    const name =
        typeof item.data.actor_name === 'string' && item.data.actor_name !== ''
            ? item.data.actor_name
            : 'Someone';
    const body = notificationBody(item);
    const avatar =
        typeof item.data.actor_avatar === 'string'
            ? item.data.actor_avatar
            : '';
    const postImage =
        typeof item.data.post_image === 'string' && item.data.post_image !== ''
            ? item.data.post_image
            : null;
    const label = item.data.message ?? `${name} ${body}`;
    const thumbSize = compact ? 'size-12' : 'size-14';

    const className = cn(
        'flex w-full items-start gap-3 rounded-lg text-left transition-colors',
        compact ? 'px-2 py-2' : 'px-3 py-3',
        unread && 'bg-[#E7F3FF]/70 dark:bg-primary/10',
        onOpen && 'cursor-pointer hover:bg-muted/60',
    );

    const content = (
        <>
            <span className="relative shrink-0">
                <Avatar className={compact ? 'size-10' : 'size-14'}>
                    <AvatarImage src={avatar || undefined} alt={name} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <TypeBadge item={item} />
            </span>

            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        'block text-sm leading-snug',
                        unread ? 'text-foreground' : 'text-foreground/90',
                    )}
                >
                    <span className="font-semibold">{name}</span>{' '}
                    <span className={unread ? undefined : 'font-normal'}>
                        {body}
                    </span>
                </span>
                {item.created_at ? (
                    <time
                        dateTime={item.created_at}
                        className={cn(
                            'mt-0.5 block text-xs',
                            unread
                                ? 'font-medium text-[#1877F2]'
                                : 'text-muted-foreground',
                        )}
                    >
                        {relativeTime(item.created_at)}
                    </time>
                ) : null}
            </span>

            {unread ? (
                <span
                    aria-hidden
                    className="mt-2 size-3 shrink-0 rounded-full bg-[#1877F2]"
                />
            ) : null}

            {postImage ? (
                <img
                    src={postImage}
                    alt=""
                    className={cn(
                        'mt-0.5 shrink-0 rounded-md object-cover',
                        thumbSize,
                    )}
                />
            ) : null}
        </>
    );

    if (onOpen) {
        return (
            <button
                type="button"
                onClick={() => onOpen(item)}
                aria-label={typeof label === 'string' ? label : undefined}
                className={className}
                data-test="notification-item"
            >
                {content}
            </button>
        );
    }

    return (
        <div className={className} data-test="notification-item">
            {content}
        </div>
    );
}

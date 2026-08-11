import { Link, router } from '@inertiajs/react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { PostBody } from '@/components/posts/post-body';
import { LegacyPostImage, PostMedia } from '@/components/posts/post-media';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { SharedPost } from '@/types';

type Props = {
    shared: SharedPost;
    className?: string;
    /**
     * `default` — full nested card (feed / share dialogs).
     * `snippet` — compact teaser for DMs (author + short text + optional thumb).
     */
    variant?: 'default' | 'snippet';
};

function firstMediaUrl(shared: SharedPost): string | null {
    const ready = shared.media?.find((item) => item.status === 'ready');

    return ready?.url ?? shared.media?.[0]?.url ?? shared.image_url;
}

function snippetText(body: string): string {
    const plain = body.replace(/\s+/g, ' ').trim();

    if (plain.length <= 120) {
        return plain;
    }

    return `${plain.slice(0, 117).trimEnd()}…`;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
    return (
        target instanceof Element &&
        target.closest('a, button, input, textarea, select, [role="button"]') !=
            null
    );
}

function openSharedPost(
    event: MouseEvent | KeyboardEvent,
    postId: number,
): void {
    if (event.metaKey || event.ctrlKey) {
        window.open(`/posts/${postId}`, '_blank', 'noopener,noreferrer');

        return;
    }

    router.visit(`/posts/${postId}`);
}

export function SharedPostEmbed({
    shared,
    className,
    variant = 'default',
}: Props) {
    const getInitials = useInitials();

    if (shared.unavailable || !shared.user) {
        return (
            <div
                className={cn(
                    'rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground',
                    className,
                )}
            >
                This content isn&apos;t available right now.
            </div>
        );
    }

    if (variant === 'snippet') {
        const thumb = firstMediaUrl(shared);

        return (
            <Link
                href={`/posts/${shared.id}`}
                className={cn(
                    'flex max-w-[240px] items-stretch gap-2 overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:bg-muted/40',
                    className,
                )}
            >
                <div className="min-w-0 flex-1 space-y-0.5 px-2.5 py-2">
                    <p className="truncate text-xs font-semibold">
                        {shared.user.name}
                    </p>
                    {shared.body ? (
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {snippetText(shared.body)}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">Photo</p>
                    )}
                </div>
                {thumb ? (
                    <img
                        src={thumb}
                        alt=""
                        className="size-16 shrink-0 object-cover"
                    />
                ) : null}
            </Link>
        );
    }

    // Card must not be an <a>: body mentions/hashtags and media controls are
    // interactive descendants (nested <a> is invalid HTML / hydration error).
    return (
        <div
            role="link"
            tabIndex={0}
            aria-label={`View post by ${shared.user.name}`}
            className={cn(
                'block cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:bg-muted/30',
                className,
            )}
            onClick={(event) => {
                if (
                    isInteractiveTarget(event.target) ||
                    event.defaultPrevented
                ) {
                    return;
                }

                openSharedPost(event, shared.id);
            }}
            onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                }

                if (isInteractiveTarget(event.target)) {
                    return;
                }

                event.preventDefault();
                openSharedPost(event, shared.id);
            }}
        >
            <div className="flex items-center gap-2 px-3 pt-2.5">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage
                        src={shared.user.avatar ?? undefined}
                        alt={shared.user.name}
                    />
                    <AvatarFallback>
                        {getInitials(shared.user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold">
                        {shared.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        @{shared.user.username}
                    </p>
                </div>
            </div>

            {shared.body ? (
                <div className="px-3 pb-1">
                    <PostBody body={shared.body} clamp />
                </div>
            ) : null}

            {shared.media?.length > 0 ? (
                <div className="overflow-hidden rounded-b-lg">
                    <PostMedia media={shared.media} />
                </div>
            ) : shared.image_url ? (
                <LegacyPostImage
                    src={shared.image_url}
                    className="overflow-hidden rounded-b-lg"
                />
            ) : null}
        </div>
    );
}

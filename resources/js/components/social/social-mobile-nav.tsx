import { Link, usePage } from '@inertiajs/react';
import { Compass, Home, MessageCircle, Plus, UserRound } from 'lucide-react';
import {
    formatBadgeCount,
    useUnreadBadges,
} from '@/components/notifications/unread-badges-provider';
import { useCreatePostOptional } from '@/components/posts/create-post-provider';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const sideItems = [
    { title: 'Home', href: '/feed', icon: Home },
    { title: 'Explore', href: '/explore', icon: Compass },
] as const;

const rightItems = [
    // inbox=1: skip auto-open redirect so mobile lands on the conversation list
    { title: 'Messages', href: '/messages?inbox=1', icon: MessageCircle },
] as const;

type Props = {
    className?: string;
};

export function SocialMobileNav({ className }: Props) {
    const { auth } = usePage<PageProps>().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { messages } = useUnreadBadges();
    const createPost = useCreatePostOptional();
    const username = auth.user?.username;

    return (
        <nav
            className={cn(
                'social-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden',
                className,
            )}
            aria-label="Mobile"
        >
            <ul className="mx-auto flex h-14 max-w-lg items-stretch justify-around">
                {sideItems.map((item) => {
                    const active =
                        item.href === '/feed'
                            ? isCurrentUrl(item.href)
                            : isCurrentOrParentUrl(item.href);

                    return (
                        <li key={item.title} className="flex-1">
                            <Link
                                href={item.href}
                                aria-label={item.title}
                                className={cn(
                                    'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground',
                                    active && 'text-primary',
                                )}
                            >
                                <item.icon className="size-5" aria-hidden />
                                <span aria-hidden>{item.title}</span>
                            </Link>
                        </li>
                    );
                })}

                <li className="flex flex-1 items-center justify-center">
                    <button
                        type="button"
                        aria-label="Create post"
                        aria-expanded={createPost?.isOpen ?? false}
                        disabled={!createPost || createPost.isOpen}
                        onClick={() => createPost?.openCreatePost()}
                        className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition enabled:active:scale-95 disabled:opacity-40"
                    >
                        <Plus className="size-6" strokeWidth={2.5} />
                    </button>
                </li>

                {rightItems.map((item) => {
                    const active = isCurrentOrParentUrl('/messages');
                    const badge = messages;

                    return (
                        <li key={item.title} className="flex-1">
                            <Link
                                href={item.href}
                                aria-label={
                                    badge > 0
                                        ? `${item.title}, ${badge} unread`
                                        : item.title
                                }
                                className={cn(
                                    'relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground',
                                    active && 'text-primary',
                                )}
                            >
                                <item.icon className="size-5" aria-hidden />
                                <span aria-hidden>{item.title}</span>
                                {badge > 0 ? (
                                    <span
                                        aria-live="polite"
                                        className="absolute top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] text-white"
                                    >
                                        {formatBadgeCount(badge)}
                                    </span>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}

                {username ? (
                    <li className="flex-1">
                        <Link
                            href={`/u/${username}`}
                            aria-label="Profile"
                            className={cn(
                                'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground',
                                isCurrentOrParentUrl(`/u/${username}`) &&
                                    'text-primary',
                            )}
                        >
                            <UserRound className="size-5" aria-hidden />
                            <span aria-hidden>Profile</span>
                        </Link>
                    </li>
                ) : null}
            </ul>
        </nav>
    );
}

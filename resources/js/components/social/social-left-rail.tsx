import { Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import {
    formatBadgeCount,
    useUnreadBadges,
} from '@/components/notifications/unread-badges-provider';
import { buildSocialNavItems } from '@/components/social/social-nav-items';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function SocialLeftRail() {
    const { auth } = usePage<PageProps>().props;
    const { notifications, messages } = useUnreadBadges();
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const items = buildSocialNavItems({
        ...auth,
        unread_messages_count: messages,
        unread_notifications_count: notifications,
    });
    const reduce = usePrefersReducedMotion();

    return (
        <nav
            className="hidden h-full min-h-0 w-56 shrink-0 overflow-y-auto py-4 lg:block"
            aria-label="Main"
        >
            <ul className="space-y-1 pr-2">
                {items.map((item) => {
                    const active =
                        item.href === '/feed'
                            ? isCurrentUrl(item.href)
                            : isCurrentOrParentUrl(item.href);
                    const badge = item.badge ?? 0;
                    const isMessages = item.href === '/messages';

                    return (
                        <li key={item.title} className="relative">
                            {active && !reduce ? (
                                <motion.div
                                    layoutId="nav-active-pill"
                                    className="absolute inset-0 rounded-full bg-primary/10"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 34,
                                    }}
                                />
                            ) : null}
                            <Link
                                href={item.href}
                                prefetch={!isMessages}
                                aria-label={
                                    badge > 0
                                        ? `${item.title}, ${badge} unread`
                                        : item.title
                                }
                                className={cn(
                                    'relative z-10 flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/80',
                                    active && 'font-semibold text-primary',
                                    active && reduce && 'bg-primary/10',
                                )}
                            >
                                {item.icon ? (
                                    <item.icon
                                        className={cn(
                                            'size-6',
                                            active && 'text-primary',
                                        )}
                                    />
                                ) : null}
                                <span className="flex-1" aria-hidden>
                                    {item.title}
                                </span>
                                {badge > 0 ? (
                                    <span
                                        aria-hidden
                                        className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white"
                                    >
                                        {formatBadgeCount(badge)}
                                    </span>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

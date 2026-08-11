import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { NotificationItem } from '@/components/notifications/notification-item';
import {
    formatBadgeCount,
    useUnreadBadges,
} from '@/components/notifications/unread-badges-provider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppNotification, Auth } from '@/types';

type AuthProps = {
    auth: Auth;
    recent_notifications?: AppNotification[];
};

function markAllAsRead(clearNotifications: () => void): void {
    clearNotifications();

    router
        .optimistic((props: AuthProps) => {
            const recent = props.recent_notifications ?? [];
            const now = new Date().toISOString();

            return {
                auth: {
                    ...props.auth,
                    unread_notifications_count: 0,
                },
                recent_notifications: recent.map((entry) => ({
                    ...entry,
                    read_at: entry.read_at ?? now,
                })),
            };
        })
        .patch(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
}

function openNotification(item: AppNotification): void {
    const url = item.data.url ? String(item.data.url) : null;

    if (url) {
        router.visit(url);
    }
}

export function NotificationBell() {
    const reduce = usePrefersReducedMotion();
    const {
        notifications: unread,
        recent: items,
        clearNotifications,
    } = useUnreadBadges();

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (open && unread > 0) {
                    markAllAsRead(clearNotifications);
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    data-test="notification-bell"
                    aria-label={
                        unread > 0
                            ? `Notifications, ${unread} unread`
                            : 'Notifications'
                    }
                >
                    <Bell className="size-5" />
                    {unread > 0 ? (
                        <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            aria-live="polite"
                            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white"
                        >
                            {formatBadgeCount(unread)}
                        </motion.span>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
                <DropdownMenuLabel className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="text-base font-bold">Notifications</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-0" />
                {items.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto p-1.5">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={reduce ? false : { opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <DropdownMenuItem
                                    className="cursor-pointer p-0 focus:bg-transparent"
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openNotification(item);
                                    }}
                                >
                                    <NotificationItem item={item} compact />
                                </DropdownMenuItem>
                            </motion.div>
                        ))}
                    </div>
                )}
                <DropdownMenuSeparator className="my-0" />
                <DropdownMenuItem
                    asChild
                    className="justify-center rounded-none py-2.5"
                >
                    <Link
                        href="/notifications"
                        className="w-full justify-center font-medium text-[#1877F2]"
                    >
                        View all
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

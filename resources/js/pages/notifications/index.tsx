import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { NotificationItem } from '@/components/notifications/notification-item';
import { useUnreadBadges } from '@/components/notifications/unread-badges-provider';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { AppNotification } from '@/types';

type Props = {
    notifications: {
        data: AppNotification[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
};

function openNotification(notification: AppNotification): void {
    const url = notification.data.url ? String(notification.data.url) : null;

    if (url) {
        router.visit(url);
    }
}

function NotificationSection({
    title,
    items,
    onOpen,
}: {
    title: string;
    items: AppNotification[];
    onOpen: (item: AppNotification) => void;
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-1">
            <h2 className="px-3 pt-2 text-[17px] font-bold tracking-tight">
                {title}
            </h2>
            <ul className="flex flex-col">
                {items.map((notification) => (
                    <li key={notification.id}>
                        <NotificationItem item={notification} onOpen={onOpen} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function NotificationsIndex({ notifications }: Props) {
    const { clearNotifications } = useUnreadBadges();

    // Index marks unread in the controller; sync local badge immediately.
    useEffect(() => {
        clearNotifications();
    }, [clearNotifications]);

    const unread = notifications.data.filter((item) => !item.read_at);
    const earlier = notifications.data.filter((item) => item.read_at);

    return (
        <>
            <Head title="Notifications" />
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 px-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Notifications
                    </h1>
                </div>

                {notifications.data.length === 0 ? (
                    <div className="overflow-hidden rounded-lg bg-card shadow-xs">
                        <EmptyState
                            title="You're all caught up"
                            description="New likes, comments, and follows will show up here."
                            action={
                                <Button asChild>
                                    <Link href="/feed">Go to feed</Link>
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-card py-1 shadow-xs">
                        <NotificationSection
                            title="New"
                            items={unread}
                            onOpen={openNotification}
                        />
                        <NotificationSection
                            title="Earlier"
                            items={earlier}
                            onOpen={openNotification}
                        />
                    </div>
                )}

                {notifications.next_page_url ? (
                    <Button asChild variant="outline" className="w-full">
                        <Link href={notifications.next_page_url} preserveScroll>
                            Load more
                        </Link>
                    </Button>
                ) : null}
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [],
};

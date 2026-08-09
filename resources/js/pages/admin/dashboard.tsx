import { Head, Link } from '@inertiajs/react';

type Metrics = {
    users_total: number;
    users_suspended: number;
    posts_total: number;
    posts_7d: number;
    likes_7d: number;
    comments_7d: number;
    messages_7d: number;
    conversations_total: number;
};

type Props = {
    metrics: Metrics;
};

export default function AdminDashboard({ metrics }: Props) {
    const cards: { label: string; value: number }[] = [
        { label: 'Users', value: metrics.users_total },
        { label: 'Suspended', value: metrics.users_suspended },
        { label: 'Posts (all)', value: metrics.posts_total },
        { label: 'Posts (7d)', value: metrics.posts_7d },
        { label: 'Likes (7d)', value: metrics.likes_7d },
        { label: 'Comments (7d)', value: metrics.comments_7d },
        { label: 'Messages (7d)', value: metrics.messages_7d },
        { label: 'Conversations', value: metrics.conversations_total },
    ];

    return (
        <>
            <Head title="Admin · Dashboard" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Admin dashboard</h1>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <Link href="/admin/users" className="hover:underline">
                            Users
                        </Link>
                        <Link href="/admin/posts" className="hover:underline">
                            Posts
                        </Link>
                        <Link
                            href="/admin/failed-jobs"
                            className="hover:underline"
                        >
                            Failed jobs
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border px-4 py-3"
                        >
                            <p className="text-xs text-muted-foreground">
                                {card.label}
                            </p>
                            <p className="text-2xl font-semibold tabular-nums">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin', href: '/admin' }],
};

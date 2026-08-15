import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Metrics = {
    users_total: number;
    users_suspended: number;
    posts_total: number;
    posts_pending: number;
    posts_7d: number;
    likes_7d: number;
    comments_7d: number;
    messages_7d: number;
    conversations_total: number;
    reports_open: number;
};

type Props = {
    metrics: Metrics;
};

type MetricCard = {
    label: string;
    value: number;
    href?: string;
};

function MetricGrid({ title, cards }: { title: string; cards: MetricCard[] }) {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
                {title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const inner = (
                        <Card
                            className={cn(
                                'gap-2 py-4',
                                card.href &&
                                    'transition-colors hover:bg-muted/40',
                            )}
                        >
                            <CardHeader className="px-4">
                                <CardDescription>{card.label}</CardDescription>
                                <CardTitle className="text-2xl tabular-nums">
                                    {card.value}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    );

                    if (!card.href) {
                        return <div key={card.label}>{inner}</div>;
                    }

                    return (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            {inner}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

export default function AdminDashboard({ metrics }: Props) {
    const community: MetricCard[] = [
        {
            label: 'Users',
            value: metrics.users_total,
            href: '/admin/users',
        },
        {
            label: 'Suspended',
            value: metrics.users_suspended,
            href: '/admin/users',
        },
        {
            label: 'Posts',
            value: metrics.posts_total,
            href: '/admin/posts?status=all',
        },
        {
            label: 'Pending posts',
            value: metrics.posts_pending,
            href: '/admin/posts?status=pending',
        },
        {
            label: 'Open reports',
            value: metrics.reports_open,
            href: '/admin/reports?status=open',
        },
    ];

    const activity: MetricCard[] = [
        {
            label: 'Posts (7d)',
            value: metrics.posts_7d,
            href: '/admin/posts?status=all',
        },
        { label: 'Likes (7d)', value: metrics.likes_7d },
        { label: 'Comments (7d)', value: metrics.comments_7d },
    ];

    return (
        <>
            <Head title="Admin · Dashboard" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Community size and recent activity.
                    </p>
                </div>

                <MetricGrid title="Community" cards={community} />
                <MetricGrid title="Activity" cards={activity} />

                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Ops
                    </h2>
                    <Link
                        href="/admin/failed-jobs"
                        className="block max-w-sm rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <Card className="gap-2 py-4 transition-colors hover:bg-muted/40">
                            <CardHeader className="px-4">
                                <CardTitle className="text-base">
                                    Failed jobs
                                </CardTitle>
                                <CardDescription>
                                    Inspect queue failures. Retry from the CLI
                                    or Horizon.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin' }],
};

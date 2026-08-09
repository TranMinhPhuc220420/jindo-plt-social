import { Head, Link } from '@inertiajs/react';

type FailedJob = {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    display_name: string;
    failed_at: string;
    exception: string;
};

type Props = {
    jobs: {
        data: FailedJob[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
};

export default function AdminFailedJobsIndex({ jobs }: Props) {
    return (
        <>
            <Head title="Admin · Failed jobs" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Failed jobs</h1>
                        <p className="text-sm text-muted-foreground">
                            Read-only view. Retry via{' '}
                            <code className="text-xs">
                                php artisan queue:retry
                            </code>
                            .
                        </p>
                    </div>
                    <Link href="/admin" className="text-sm hover:underline">
                        ← Dashboard
                    </Link>
                </div>

                <ul className="divide-y rounded-xl border">
                    {jobs.data.length === 0 ? (
                        <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                            No failed jobs.
                        </li>
                    ) : (
                        jobs.data.map((job) => (
                            <li key={job.id} className="space-y-1 px-4 py-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="font-medium">
                                        {job.display_name}
                                    </p>
                                    <time className="text-xs text-muted-foreground">
                                        {job.failed_at}
                                    </time>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {job.connection} / {job.queue} · {job.uuid}
                                </p>
                                <pre className="overflow-x-auto rounded-md bg-muted/50 p-2 text-[11px] whitespace-pre-wrap">
                                    {job.exception}
                                </pre>
                            </li>
                        ))
                    )}
                </ul>

                <div className="flex justify-between">
                    {jobs.prev_page_url ? (
                        <Link
                            href={jobs.prev_page_url}
                            className="text-sm hover:underline"
                        >
                            Previous
                        </Link>
                    ) : (
                        <span />
                    )}
                    {jobs.next_page_url ? (
                        <Link
                            href={jobs.next_page_url}
                            className="text-sm hover:underline"
                        >
                            Next
                        </Link>
                    ) : null}
                </div>
            </div>
        </>
    );
}

AdminFailedJobsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin' },
        { title: 'Failed jobs', href: '/admin/failed-jobs' },
    ],
};

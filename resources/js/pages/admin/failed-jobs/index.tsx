import { Head } from '@inertiajs/react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Failed jobs</h1>
                    <p className="text-sm text-muted-foreground">
                        Read-only view. Retry via{' '}
                        <code className="text-xs">php artisan queue:retry</code>{' '}
                        or Horizon.
                    </p>
                </div>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job</TableHead>
                                <TableHead>Queue</TableHead>
                                <TableHead>Failed at</TableHead>
                                <TableHead>Exception</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No failed jobs.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.data.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {job.display_name}
                                            </div>
                                            <div className="max-w-[16rem] truncate text-xs text-muted-foreground">
                                                {job.uuid}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {job.connection} / {job.queue}
                                        </TableCell>
                                        <TableCell>{job.failed_at}</TableCell>
                                        <TableCell className="max-w-md whitespace-normal">
                                            <pre className="max-h-24 overflow-auto rounded-md bg-muted/50 p-2 text-[11px] whitespace-pre-wrap">
                                                {job.exception}
                                            </pre>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AdminPagination paginator={jobs} />
            </div>
        </>
    );
}

AdminFailedJobsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Failed jobs', href: '/admin/failed-jobs' },
    ],
};

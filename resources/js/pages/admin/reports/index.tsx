import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type ReportStatus = 'open' | 'reviewed' | 'dismissed';
type StatusFilter = ReportStatus | 'all';

type AdminReport = {
    id: number;
    reason: string;
    reason_label: string;
    details: string | null;
    status: ReportStatus;
    created_at: string | null;
    reporter: {
        id: number;
        name: string;
        username: string;
    };
    target: {
        type: string;
        id: number | null;
        body: string;
        deleted: boolean;
        href: string | null;
        thumb: string | null;
    };
};

type Props = {
    reports: {
        data: AdminReport[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        status: StatusFilter;
    };
};

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
    { id: 'open', label: 'Open' },
    { id: 'reviewed', label: 'Reviewed' },
    { id: 'dismissed', label: 'Dismissed' },
    { id: 'all', label: 'All' },
];

function statusBadge(status: ReportStatus) {
    if (status === 'reviewed') {
        return <Badge>Reviewed</Badge>;
    }

    if (status === 'dismissed') {
        return <Badge variant="secondary">Dismissed</Badge>;
    }

    return <Badge variant="destructive">Open</Badge>;
}

export default function AdminReportsIndex({ reports, filters }: Props) {
    const [pending, setPending] = useState<{
        id: number;
        action: 'dismiss' | 'resolve';
    } | null>(null);
    const [processing, setProcessing] = useState(false);

    function setStatus(status: StatusFilter): void {
        router.get(
            '/admin/reports',
            { status },
            { preserveState: true, preserveScroll: true },
        );
    }

    function confirmAction(): void {
        if (!pending) {
            return;
        }

        setProcessing(true);
        router.patch(
            `/admin/reports/${pending.id}/${pending.action}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setPending(null);
                },
            },
        );
    }

    return (
        <>
            <Head title="Admin · Reports" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Reports</h1>
                    <p className="text-sm text-muted-foreground">
                        Community reports of posts and comments.
                    </p>
                </div>

                <div className="flex flex-wrap gap-1">
                    {STATUS_TABS.map((tab) => (
                        <Button
                            key={tab.id}
                            type="button"
                            size="sm"
                            variant={
                                filters.status === tab.id
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            className={cn(
                                filters.status === tab.id && 'font-semibold',
                            )}
                            onClick={() => setStatus(tab.id)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reporter</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-muted-foreground"
                                    >
                                        No reports.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.data.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="align-top">
                                            <p className="font-medium">
                                                {report.reporter.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                @{report.reporter.username}
                                            </p>
                                        </TableCell>
                                        <TableCell className="max-w-sm align-top">
                                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {report.target.type}
                                                {report.target.deleted
                                                    ? ' · removed'
                                                    : ''}
                                            </p>
                                            <p className="line-clamp-3 text-sm">
                                                {report.target.body}
                                            </p>
                                            {report.target.href ? (
                                                <Button
                                                    asChild
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto px-0"
                                                >
                                                    <Link
                                                        href={
                                                            report.target.href
                                                        }
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="text-sm">
                                                {report.reason_label}
                                            </p>
                                            {report.details ? (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {report.details}
                                                </p>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {statusBadge(report.status)}
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right align-top">
                                            {report.status === 'open' ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setPending({
                                                                id: report.id,
                                                                action: 'dismiss',
                                                            })
                                                        }
                                                    >
                                                        Dismiss
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            setPending({
                                                                id: report.id,
                                                                action: 'resolve',
                                                            })
                                                        }
                                                    >
                                                        {report.target.type ===
                                                        'comment'
                                                            ? 'Delete comment'
                                                            : 'Reject post'}
                                                    </Button>
                                                </>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AdminPagination paginator={reports} />
            </div>

            <ConfirmDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPending(null);
                    }
                }}
                title={
                    pending?.action === 'resolve'
                        ? 'Resolve this report?'
                        : 'Dismiss this report?'
                }
                description={
                    pending?.action === 'resolve'
                        ? 'The post will be rejected or the comment deleted, then the report marked reviewed.'
                        : 'The report will be closed without removing the content.'
                }
                confirmLabel={
                    pending?.action === 'resolve' ? 'Resolve' : 'Dismiss'
                }
                destructive={pending?.action === 'resolve'}
                processing={processing}
                onConfirm={confirmAction}
            />
        </>
    );
}

AdminReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Reports', href: '/admin/reports' },
    ],
};

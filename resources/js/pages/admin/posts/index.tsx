import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

type ModerationStatus = 'pending' | 'approved' | 'rejected';
type StatusFilter = ModerationStatus | 'all';

type AdminPost = {
    id: number;
    body: string;
    moderation_status: ModerationStatus;
    moderation_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
    media: { id: number; url: string }[];
    shared_post: {
        unavailable: boolean;
        body: string;
        user: {
            name: string;
            username: string;
            avatar: string | null;
        } | null;
    } | null;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
    };
};

type Props = {
    posts: {
        data: AdminPost[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        q: string;
        status: StatusFilter;
    };
};

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
];

function statusBadge(status: ModerationStatus) {
    if (status === 'approved') {
        return <Badge>Approved</Badge>;
    }

    if (status === 'rejected') {
        return <Badge variant="destructive">Rejected</Badge>;
    }

    return <Badge variant="secondary">Pending</Badge>;
}

export default function AdminPostsIndex({ posts, filters }: Props) {
    const getInitials = useInitials();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [rejectPost, setRejectPost] = useState<AdminPost | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    function visit(params: { q?: string; status?: StatusFilter }): void {
        router.get(
            '/admin/posts',
            {
                q: params.q ?? filters.q,
                status: params.status ?? filters.status,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function submitSearch(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get('q') ?? '');
        visit({ q });
    }

    function confirmDelete(): void {
        if (pendingId === null) {
            return;
        }

        setProcessing(true);
        router.delete(`/admin/posts/${pendingId}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setPendingId(null);
            },
        });
    }

    function approve(id: number): void {
        setProcessing(true);
        router.patch(
            `/admin/posts/${id}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    }

    function confirmReject(): void {
        if (rejectPost === null || rejectReason.trim() === '') {
            return;
        }

        setProcessing(true);
        router.patch(
            `/admin/posts/${rejectPost.id}/reject`,
            { reason: rejectReason.trim() },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setRejectPost(null);
                    setRejectReason('');
                },
            },
        );
    }

    return (
        <>
            <Head title="Admin · Posts" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Posts</h1>
                    <p className="text-sm text-muted-foreground">
                        Review submissions before they appear on the feed.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {STATUS_TABS.map((tab) => (
                        <Button
                            key={tab.id}
                            type="button"
                            size="sm"
                            variant={
                                filters.status === tab.id
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => visit({ status: tab.id })}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <form onSubmit={submitSearch} className="flex max-w-lg gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Search body or author"
                        aria-label="Search posts"
                    />
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-48">Author</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead className="w-28">Status</TableHead>
                                <TableHead className="w-40">Dates</TableHead>
                                <TableHead className="w-48">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No posts match this filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.data.map((post) => (
                                    <TableRow
                                        key={post.id}
                                        className="align-top"
                                    >
                                        <TableCell>
                                            <div className="flex items-start gap-2">
                                                <Avatar className="size-9">
                                                    <AvatarImage
                                                        src={
                                                            post.user.avatar ??
                                                            undefined
                                                        }
                                                        alt={post.user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            post.user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {post.user.name}
                                                    </div>
                                                    <div className="truncate text-muted-foreground">
                                                        @{post.user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xl">
                                            {post.body ? (
                                                <p className="line-clamp-6 whitespace-pre-wrap">
                                                    {post.body}
                                                </p>
                                            ) : null}
                                            {post.shared_post ? (
                                                <div className="mt-2 rounded-md border bg-muted/40 p-2 text-sm">
                                                    <div className="text-xs font-medium text-muted-foreground">
                                                        Share of{' '}
                                                        {post.shared_post
                                                            .unavailable
                                                            ? 'unavailable post'
                                                            : `@${post.shared_post.user?.username ?? 'user'}`}
                                                    </div>
                                                    {post.shared_post
                                                        .unavailable ? null : (
                                                        <p className="mt-1 line-clamp-3">
                                                            {
                                                                post.shared_post
                                                                    .body
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ) : null}
                                            {post.media.length > 0 ? (
                                                <div className="mt-2 flex gap-1">
                                                    {post.media.map((item) => (
                                                        <img
                                                            key={item.id}
                                                            src={item.url}
                                                            alt=""
                                                            className="size-14 rounded object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            ) : null}
                                            {post.moderation_status ===
                                                'rejected' &&
                                            post.moderation_reason ? (
                                                <p className="mt-2 text-xs text-destructive">
                                                    {post.moderation_reason}
                                                </p>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            {statusBadge(
                                                post.moderation_status,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            <div>
                                                {post.created_at
                                                    ? new Date(
                                                          post.created_at,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </div>
                                            {post.updated_at &&
                                            post.updated_at !==
                                                post.created_at ? (
                                                <div>
                                                    Updated{' '}
                                                    {new Date(
                                                        post.updated_at,
                                                    ).toLocaleString()}
                                                </div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {post.moderation_status !==
                                                'approved' ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={processing}
                                                        onClick={() =>
                                                            approve(post.id)
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                ) : null}
                                                {post.moderation_status !==
                                                'rejected' ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={processing}
                                                        onClick={() => {
                                                            setRejectPost(post);
                                                            setRejectReason('');
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                ) : null}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={processing}
                                                    onClick={() =>
                                                        setPendingId(post.id)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/posts/${post.id}`}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AdminPagination paginator={posts} />
            </div>

            <ConfirmDialog
                open={pendingId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingId(null);
                    }
                }}
                title="Delete this post?"
                description="This permanently removes the post for everyone."
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={confirmDelete}
            />

            <Dialog
                open={rejectPost !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectPost(null);
                        setRejectReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject this post?</DialogTitle>
                        <DialogDescription>
                            The author will see this reason and can edit to
                            resubmit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="reject-reason">Reason</Label>
                        <textarea
                            id="reject-reason"
                            value={rejectReason}
                            onChange={(event) =>
                                setRejectReason(event.target.value)
                            }
                            maxLength={500}
                            rows={4}
                            required
                            className={cn(
                                'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground',
                                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setRejectPost(null);
                                setRejectReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={processing || rejectReason.trim() === ''}
                            onClick={confirmReject}
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminPostsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Posts', href: '/admin/posts' },
    ],
};

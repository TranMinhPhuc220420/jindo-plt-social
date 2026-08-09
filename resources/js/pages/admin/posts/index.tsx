import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Button } from '@/components/ui/button';

type AdminPost = {
    id: number;
    body: string;
    created_at: string | null;
    user: {
        id: number;
        name: string;
        username: string;
    };
};

type Props = {
    posts: {
        data: AdminPost[];
    };
};

export default function AdminPostsIndex({ posts }: Props) {
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

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

    return (
        <>
            <Head title="Admin · Posts" />
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">Posts</h1>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="/admin"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/admin/users"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Manage users
                        </a>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-xl bg-card shadow-xs">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-3 py-2 font-medium">
                                    Author
                                </th>
                                <th className="px-3 py-2 font-medium">Body</th>
                                <th className="px-3 py-2 font-medium">
                                    Created
                                </th>
                                <th className="px-3 py-2 font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.data.map((post) => (
                                <tr key={post.id} className="border-b">
                                    <td className="px-3 py-2">
                                        @{post.user.username}
                                    </td>
                                    <td className="px-3 py-2">{post.body}</td>
                                    <td className="px-3 py-2">
                                        {post.created_at
                                            ? new Date(
                                                  post.created_at,
                                              ).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                setPendingId(post.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
        </>
    );
}

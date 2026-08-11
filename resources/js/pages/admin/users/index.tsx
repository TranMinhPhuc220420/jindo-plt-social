import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Button } from '@/components/ui/button';

type AdminUser = {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    suspended_at: string | null;
    created_at: string | null;
};

type Props = {
    users: {
        data: AdminUser[];
    };
};

export default function AdminUsersIndex({ users }: Props) {
    const [pending, setPending] = useState<AdminUser | null>(null);
    const [processing, setProcessing] = useState(false);

    function confirmToggle(): void {
        if (!pending) {
            return;
        }

        setProcessing(true);
        router.post(
            `/admin/users/${pending.id}`,
            {
                _method: 'patch',
                suspended: pending.suspended_at ? '0' : '1',
            },
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
            <Head title="Admin · Users" />
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">Users</h1>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="/admin"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/admin/posts"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Manage posts
                        </a>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-xl bg-card shadow-xs">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-3 py-2 font-medium">User</th>
                                <th className="px-3 py-2 font-medium">Email</th>
                                <th className="px-3 py-2 font-medium">Role</th>
                                <th className="px-3 py-2 font-medium">
                                    Status
                                </th>
                                <th className="px-3 py-2 font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="px-3 py-2">
                                        <div className="font-medium">
                                            {user.name}
                                        </div>
                                        <div className="text-muted-foreground">
                                            @{user.username}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">{user.email}</td>
                                    <td className="px-3 py-2">{user.role}</td>
                                    <td className="px-3 py-2">
                                        {user.suspended_at
                                            ? 'Suspended'
                                            : 'Active'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {user.role !== 'admin' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPending(user)}
                                            >
                                                {user.suspended_at
                                                    ? 'Unsuspend'
                                                    : 'Suspend'}
                                            </Button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPending(null);
                    }
                }}
                title={
                    pending?.suspended_at
                        ? 'Unsuspend this user?'
                        : 'Suspend this user?'
                }
                description={
                    pending
                        ? `@${pending.username} will ${pending.suspended_at ? 'regain' : 'lose'} access to the app.`
                        : undefined
                }
                confirmLabel={pending?.suspended_at ? 'Unsuspend' : 'Suspend'}
                destructive={!pending?.suspended_at}
                processing={processing}
                onConfirm={confirmToggle}
            />
        </>
    );
}

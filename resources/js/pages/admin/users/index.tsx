import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { AdminPagination } from '@/components/admin/admin-pagination';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
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
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        q: string;
    };
    passwordRules: string;
};

function ageFromIsoDate(value: string): number | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const birth = new Date(`${value}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();

    if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < birth.getDate())
    ) {
        age -= 1;
    }

    return age;
}

export default function AdminUsersIndex({
    users,
    filters,
    passwordRules,
}: Props) {
    const [pending, setPending] = useState<AdminUser | null>(null);
    const [processing, setProcessing] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [birthday, setBirthday] = useState('');

    const age = birthday ? ageFromIsoDate(birthday) : null;
    const needsGuardian = age !== null && age < 16;
    const needsChildConsent = age !== null && age >= 7 && age < 16;
    const needsUnder18Attest = age !== null && age >= 16 && age < 18;

    function submitSearch(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get('q') ?? '');
        router.get(
            '/admin/users',
            { q },
            { preserveState: true, preserveScroll: true },
        );
    }

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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            Create accounts and suspend members.
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        data-test="admin-create-user-button"
                    >
                        Create user
                    </Button>
                </div>

                <form onSubmit={submitSearch} className="flex max-w-lg gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Search name, username, or email"
                        aria-label="Search users"
                    />
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No users match this search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {user.name}
                                            </div>
                                            <div className="text-muted-foreground">
                                                @{user.username}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-normal">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'admin'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.suspended_at
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                            >
                                                {user.suspended_at
                                                    ? 'Suspended'
                                                    : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.role !== 'admin' ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setPending(user)
                                                    }
                                                >
                                                    {user.suspended_at
                                                        ? 'Unsuspend'
                                                        : 'Suspend'}
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AdminPagination paginator={users} />
            </div>

            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);

                    if (!open) {
                        setBirthday('');
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create user</DialogTitle>
                        <DialogDescription>
                            Set a temporary password and share it with the
                            person. They can sign in immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...UserController.store.form()}
                        resetOnSuccess
                        options={{ preserveScroll: true }}
                        className="grid gap-4"
                        onSuccess={() => setCreateOpen(false)}
                    >
                        {({ processing: creating, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">Name</Label>
                                    <Input
                                        id="create-name"
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-username">
                                        Username
                                    </Label>
                                    <Input
                                        id="create-username"
                                        name="username"
                                        required
                                        autoComplete="username"
                                        placeholder="your_handle"
                                        pattern="[a-z0-9_]+"
                                        minLength={3}
                                        maxLength={30}
                                    />
                                    <InputError message={errors.username} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-email">Email</Label>
                                    <Input
                                        id="create-email"
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-birthday">
                                        Date of birth
                                    </Label>
                                    <Input
                                        id="create-birthday"
                                        type="date"
                                        name="birthday"
                                        required
                                        value={birthday}
                                        onChange={(event) =>
                                            setBirthday(event.target.value)
                                        }
                                    />
                                    <InputError message={errors.birthday} />
                                    {age !== null ? (
                                        <p className="text-xs text-muted-foreground">
                                            Age {age}
                                        </p>
                                    ) : null}
                                </div>
                                {needsGuardian ? (
                                    <div className="grid gap-3 rounded-md border p-3">
                                        <p className="text-sm font-medium">
                                            Guardian consent (under 16)
                                        </p>
                                        <div className="grid gap-2">
                                            <Label htmlFor="create-guardian-name">
                                                Guardian name
                                            </Label>
                                            <Input
                                                id="create-guardian-name"
                                                name="guardian_name"
                                                required
                                            />
                                            <InputError
                                                message={errors.guardian_name}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="create-guardian-email">
                                                Guardian email
                                            </Label>
                                            <Input
                                                id="create-guardian-email"
                                                type="email"
                                                name="guardian_email"
                                                required
                                            />
                                            <InputError
                                                message={errors.guardian_email}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="create-guardian-relationship">
                                                Relationship
                                            </Label>
                                            <Input
                                                id="create-guardian-relationship"
                                                name="guardian_relationship"
                                                required
                                                placeholder="Parent, school, …"
                                            />
                                            <InputError
                                                message={
                                                    errors.guardian_relationship
                                                }
                                            />
                                        </div>
                                        <Label className="flex items-start gap-2 font-normal">
                                            <input
                                                type="checkbox"
                                                name="guardian_consented"
                                                value="1"
                                                required
                                                className="mt-1 size-4"
                                            />
                                            Guardian consented to this account.
                                        </Label>
                                        <InputError
                                            message={errors.guardian_consented}
                                        />
                                        {needsChildConsent ? (
                                            <>
                                                <Label className="flex items-start gap-2 font-normal">
                                                    <input
                                                        type="checkbox"
                                                        name="child_consented"
                                                        value="1"
                                                        required
                                                        className="mt-1 size-4"
                                                    />
                                                    Learner (7–15) also
                                                    consented after an
                                                    explanation.
                                                </Label>
                                                <InputError
                                                    message={
                                                        errors.child_consented
                                                    }
                                                />
                                            </>
                                        ) : null}
                                    </div>
                                ) : null}
                                {needsUnder18Attest ? (
                                    <div className="grid gap-2 rounded-md border p-3">
                                        <Label className="flex items-start gap-2 font-normal">
                                            <input
                                                type="checkbox"
                                                name="under18_attested"
                                                value="1"
                                                required
                                                className="mt-1 size-4"
                                            />
                                            A parent or school is aware this
                                            16–17 year old is joining.
                                        </Label>
                                        <InputError
                                            message={errors.under18_attested}
                                        />
                                    </div>
                                ) : null}
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password">
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="create-password"
                                        name="password"
                                        required
                                        autoComplete="new-password"
                                        placeholder="Password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password-confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="create-password-confirmation"
                                        name="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={creating}
                                        data-test="admin-create-user-submit"
                                    >
                                        {creating ? <Spinner /> : null}
                                        Create user
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

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

AdminUsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
    ],
};

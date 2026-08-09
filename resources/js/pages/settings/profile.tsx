import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth, ProfileAboutSettingsField } from '@/types';

type PageProps = {
    auth: Auth;
};

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public' },
    { value: 'mutual', label: 'Friends' },
    { value: 'only_me', label: 'Only me' },
] as const;

const FIELD_INPUT: Record<string, { type: string; placeholder: string }> = {
    workplace: { type: 'text', placeholder: 'Company or workplace' },
    education: { type: 'text', placeholder: 'School or university' },
    location: { type: 'text', placeholder: 'Current city' },
    hometown: { type: 'text', placeholder: 'Hometown' },
    website: { type: 'url', placeholder: 'https://example.com' },
    birthday: { type: 'date', placeholder: '' },
    gender: { type: 'text', placeholder: 'Gender' },
    relationship_status: {
        type: 'text',
        placeholder: 'Single, In a relationship…',
    },
};

export default function Profile({
    mustVerifyEmail,
    status,
    about,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    about: { fields: ProfileAboutSettingsField[] };
}) {
    const { auth } = usePage<PageProps>().props;
    const profileUrl = `/u/${auth.user.username}`;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-8">
                <div className="rounded-lg border bg-card p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold">Photos</p>
                            <p className="text-sm text-muted-foreground">
                                Change your avatar and cover on your profile —
                                click the camera buttons.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={profileUrl}>Open profile</Link>
                        </Button>
                    </div>
                </div>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <section className="space-y-4">
                                <Heading
                                    variant="small"
                                    title="Identity"
                                    description="Name, username, email, and short bio"
                                />

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="username">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            defaultValue={auth.user.username}
                                            name="username"
                                            required
                                            autoComplete="username"
                                            pattern="[a-z0-9_]+"
                                            minLength={3}
                                            maxLength={30}
                                        />
                                        <InputError message={errors.username} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={3}
                                            maxLength={160}
                                            defaultValue={auth.user.bio ?? ''}
                                            placeholder="A short intro"
                                            className={cn(
                                                'border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none',
                                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                            )}
                                        />
                                        <InputError message={errors.bio} />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                                            <p className="text-muted-foreground">
                                                Email unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-medium text-foreground underline underline-offset-4"
                                                >
                                                    Resend verification
                                                </Link>
                                            </p>
                                            {status ===
                                                'verification-link-sent' && (
                                                <p className="mt-2 font-medium text-green-600">
                                                    Verification link sent.
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </section>

                            <section className="space-y-4">
                                <Heading
                                    variant="small"
                                    title="About details"
                                    description="Shown on your Intro card. Set who can see each field."
                                />

                                <div className="divide-y rounded-lg border bg-card">
                                    {about.fields.map((field) => {
                                        const meta = FIELD_INPUT[field.key] ?? {
                                            type: 'text',
                                            placeholder: '',
                                        };

                                        return (
                                            <div
                                                key={field.key}
                                                className="grid gap-2 p-3 sm:grid-cols-[1fr_132px] sm:items-center sm:gap-3"
                                            >
                                                <div className="grid gap-1.5">
                                                    <Label
                                                        htmlFor={field.key}
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        {field.label}
                                                    </Label>
                                                    <Input
                                                        id={field.key}
                                                        name={field.key}
                                                        type={meta.type}
                                                        defaultValue={
                                                            field.value ?? ''
                                                        }
                                                        placeholder={
                                                            meta.placeholder
                                                        }
                                                        className="h-9"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[field.key]
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label
                                                        htmlFor={`privacy-${field.key}`}
                                                        className="text-xs font-medium text-muted-foreground sm:sr-only"
                                                    >
                                                        Who can see
                                                    </Label>
                                                    <select
                                                        id={`privacy-${field.key}`}
                                                        name={`profile_privacy[${field.key}]`}
                                                        defaultValue={
                                                            field.visibility
                                                        }
                                                        className={cn(
                                                            'border-input h-9 w-full rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none',
                                                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                                        )}
                                                        aria-label={`${field.label} visibility`}
                                                    >
                                                        {VISIBILITY_OPTIONS.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="flex items-center gap-3">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save changes
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    type="button"
                                >
                                    <Link href={profileUrl}>
                                        View profile
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};

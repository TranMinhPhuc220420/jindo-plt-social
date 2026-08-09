import { Link } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    GraduationCap,
    Heart,
    Home,
    Link2,
    MapPin,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { ProfileAboutField } from '@/types';

const ICONS: Record<string, LucideIcon> = {
    workplace: Briefcase,
    education: GraduationCap,
    location: MapPin,
    hometown: Home,
    website: Link2,
    birthday: Calendar,
    gender: UserRound,
    relationship_status: Heart,
};

type Props = {
    fields: ProfileAboutField[];
    isOwn?: boolean;
    joinedAt?: string | null;
};

export function AboutSection({ fields, isOwn, joinedAt }: Props) {
    if (fields.length === 0 && !joinedAt) {
        return (
            <section className="rounded-lg bg-card shadow-xs">
                <EmptyState
                    title="No details yet"
                    description={
                        isOwn
                            ? 'Add workplace, education, and more in settings.'
                            : 'This person has not shared About details.'
                    }
                    action={
                        isOwn ? (
                            <Button asChild>
                                <Link href="/settings/profile">
                                    Edit details
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </section>
        );
    }

    return (
        <section className="rounded-lg bg-card p-4 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">About</h2>
                {isOwn ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/settings/profile">Edit</Link>
                    </Button>
                ) : null}
            </div>
            <ul className="space-y-4">
                {fields.map((field) => {
                    const Icon = ICONS[field.key] ?? UserRound;

                    return (
                        <li
                            key={field.key}
                            className="flex items-start gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0"
                        >
                            <Icon
                                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                                aria-hidden
                            />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {field.label}
                                </p>
                                {field.key === 'website' ? (
                                    <a
                                        href={field.value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base font-semibold text-primary hover:underline"
                                    >
                                        {field.value}
                                    </a>
                                ) : (
                                    <p className="text-base font-semibold">
                                        {field.value}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
                {joinedAt ? (
                    <li className="flex items-start gap-3">
                        <Calendar
                            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                            aria-hidden
                        />
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Joined
                            </p>
                            <p className="text-base font-semibold">
                                {new Date(joinedAt).toLocaleDateString(
                                    undefined,
                                    {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    },
                                )}
                            </p>
                        </div>
                    </li>
                ) : null}
            </ul>
        </section>
    );
}

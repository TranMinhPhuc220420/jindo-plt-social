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
    username: string;
    isOwn?: boolean;
    joinedAt?: string | null;
};

export function IntroCard({ fields, username, isOwn, joinedAt }: Props) {
    const hasFields = fields.length > 0;

    return (
        <section className="rounded-lg bg-card p-4 shadow-xs">
            <h2 className="text-lg font-bold">Intro</h2>

            {!hasFields && !joinedAt ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    No details to show yet.
                </p>
            ) : (
                <ul className="mt-3 space-y-3">
                    {fields.map((field) => {
                        const Icon = ICONS[field.key] ?? UserRound;

                        return (
                            <li
                                key={field.key}
                                className="flex items-start gap-2.5 text-sm"
                            >
                                <Icon
                                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                <span>
                                    <span className="text-muted-foreground">
                                        {field.label}{' '}
                                    </span>
                                    {field.key === 'website' ? (
                                        <a
                                            href={field.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            {field.value.replace(
                                                /^https?:\/\//,
                                                '',
                                            )}
                                        </a>
                                    ) : (
                                        <span className="font-semibold">
                                            {field.value}
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                    {joinedAt ? (
                        <li className="flex items-start gap-2.5 text-sm">
                            <Calendar
                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                aria-hidden
                            />
                            <span>
                                <span className="text-muted-foreground">
                                    Joined{' '}
                                </span>
                                <span className="font-semibold">
                                    {new Date(joinedAt).toLocaleDateString(
                                        undefined,
                                        {
                                            month: 'long',
                                            year: 'numeric',
                                        },
                                    )}
                                </span>
                            </span>
                        </li>
                    ) : null}
                </ul>
            )}

            <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/u/${username}/about`}>About</Link>
                </Button>
                {isOwn ? (
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/settings/profile">Edit details</Link>
                    </Button>
                ) : null}
            </div>
        </section>
    );
}

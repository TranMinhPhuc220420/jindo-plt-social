import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FollowList } from '@/components/profile/follow-list';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { ProfileListUser } from '@/types';

type PaginatedUsers = {
    data: ProfileListUser[];
    links?: { url: string | null; label: string; active: boolean }[];
    next_page_url?: string | null;
    prev_page_url?: string | null;
};

type Props = {
    profile: { name: string; username: string };
    users: PaginatedUsers;
};

function Pagination({ users }: { users: PaginatedUsers }) {
    const prevUrl = users.prev_page_url;
    const nextUrl = users.next_page_url;
    const links = users.links?.filter((link) => link.url !== null) ?? [];

    if (!prevUrl && !nextUrl && links.length === 0) {
        return null;
    }

    if (prevUrl || nextUrl) {
        return (
            <nav
                className="flex items-center justify-center gap-2"
                aria-label="Pagination"
            >
                {prevUrl ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href={prevUrl} preserveScroll>
                            Previous
                        </Link>
                    </Button>
                ) : null}
                {nextUrl ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href={nextUrl} preserveScroll>
                            Next
                        </Link>
                    </Button>
                ) : null}
            </nav>
        );
    }

    return (
        <nav
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
        >
            {links.map((link) => (
                <Button
                    key={`${link.label}-${link.url}`}
                    asChild
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                >
                    <Link href={link.url!} preserveScroll>
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </Link>
                </Button>
            ))}
        </nav>
    );
}

export default function ProfileFollowing({ profile, users }: Props) {
    return (
        <>
            <Head title={`Following · @${profile.username}`} />
            <div className="flex flex-col gap-3">
                <div className="px-1">
                    <Link
                        href={`/u/${profile.username}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />@{profile.username}
                    </Link>
                    <h1 className="mt-2 text-lg font-semibold">Following</h1>
                </div>

                <div className="rounded-lg bg-card px-2 shadow-xs">
                    {users.data.length === 0 ? (
                        <EmptyState
                            title="Not following anyone"
                            description="People this profile follows will show up here."
                        />
                    ) : (
                        <FollowList users={users.data} />
                    )}
                </div>

                <Pagination users={users} />
            </div>
        </>
    );
}

ProfileFollowing.layout = {
    breadcrumbs: [],
};

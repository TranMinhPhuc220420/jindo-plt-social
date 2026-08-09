import { Link } from '@inertiajs/react';
import { FollowButton } from '@/components/profile/follow-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import type { ProfileListUser } from '@/types';

type Props = {
    users: ProfileListUser[];
};

export function FollowList({ users }: Props) {
    const getInitials = useInitials();

    return (
        <ul className="divide-y">
            {users.map((user) => (
                <li
                    key={user.id}
                    className="flex items-center gap-3 px-1 py-3"
                >
                    <Link
                        href={`/u/${user.username}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                    >
                        <Avatar className="size-10 shrink-0">
                            <AvatarImage
                                src={user.avatar ?? undefined}
                                alt={user.name}
                            />
                            <AvatarFallback>
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">
                                {user.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                                @{user.username}
                            </p>
                            {user.bio ? (
                                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                    {user.bio}
                                </p>
                            ) : null}
                        </div>
                    </Link>
                    {user.can_follow ? (
                        <FollowButton
                            username={user.username}
                            isFollowing={Boolean(user.is_following)}
                        />
                    ) : (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/u/${user.username}`}>View</Link>
                        </Button>
                    )}
                </li>
            ))}
        </ul>
    );
}

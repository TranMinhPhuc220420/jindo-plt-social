import { Link, router, usePage } from '@inertiajs/react';
import { PenSquare, Search } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useCreatePostOptional } from '@/components/posts/create-post-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { Auth } from '@/types';

type PageProps = {
    name: string;
    auth: Auth;
};

export function SocialTopBar() {
    const { name, auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const [query, setQuery] = useState('');
    const user = auth.user;
    const createPost = useCreatePostOptional();

    function submitSearch(event: React.FormEvent): void {
        event.preventDefault();
        const q = query.trim();
        router.get('/search', q ? { q } : {}, { preserveState: true });
    }

    function openCreate(): void {
        if (createPost) {
            createPost.openCreatePost();

            return;
        }

        router.get('/feed');
    }

    return (
        <header className="z-40 shrink-0 border-b bg-card pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-1 sm:h-14 sm:gap-3 sm:px-4">
                <Link
                    href="/feed"
                    className="flex shrink-0 items-center gap-2"
                    prefetch
                >
                    <AppLogoIcon className="size-8 sm:size-9" />
                    <span className="hidden text-lg font-bold text-primary sm:inline">
                        {name}
                    </span>
                </Link>

                <form
                    onSubmit={submitSearch}
                    className="mx-auto flex min-w-0 flex-1 items-center sm:max-w-md"
                >
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground sm:left-3 sm:size-4" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="h-8 rounded-full border-0 bg-muted pl-8 text-sm sm:h-9 sm:pl-9 sm:placeholder:text-[length:inherit]"
                            aria-label="Search"
                        />
                    </div>
                </form>

                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden sm:inline-flex"
                        title="Create post"
                        onClick={openCreate}
                    >
                        <PenSquare className="size-5" />
                        <span className="sr-only">Create post</span>
                    </Button>

                    <NotificationBell />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <Avatar className="size-7 sm:size-8">
                                        <AvatarImage
                                            src={user.avatar ?? undefined}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="text-[10px] sm:text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>
        </header>
    );
}

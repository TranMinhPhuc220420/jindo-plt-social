import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Tab = 'posts' | 'about' | 'photos';

type Props = {
    username: string;
    active: Tab;
};

const TABS: { id: Tab; label: string; href: (username: string) => string }[] = [
    { id: 'posts', label: 'Posts', href: (u) => `/u/${u}` },
    { id: 'about', label: 'About', href: (u) => `/u/${u}/about` },
    { id: 'photos', label: 'Photos', href: (u) => `/u/${u}/photos` },
];

export function ProfileTabs({ username, active }: Props) {
    return (
        <nav className="flex gap-1 border-t pt-1" aria-label="Profile sections">
            {TABS.map((tab) => {
                const isActive = tab.id === active;

                return (
                    <Link
                        key={tab.id}
                        href={tab.href(username)}
                        className={cn(
                            'flex-1 border-b-2 px-2 py-2.5 text-center text-sm font-semibold transition-colors',
                            isActive
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                        )}
                        preserveScroll
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}

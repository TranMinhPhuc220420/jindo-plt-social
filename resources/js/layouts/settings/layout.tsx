import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { LegalLinks } from '@/components/legal/legal-links';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-1 py-4 sm:px-2">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Account, privacy details, and appearance.
                </p>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <aside className="lg:w-44 lg:shrink-0">
                    <nav
                        className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant={active ? 'secondary' : 'ghost'}
                                    asChild
                                    className={cn(
                                        'justify-start whitespace-nowrap',
                                        active && 'font-semibold',
                                    )}
                                >
                                    <Link href={item.href}>{item.title}</Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="min-w-0 flex-1">
                    <section className="max-w-xl space-y-8">{children}</section>
                    <LegalLinks className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

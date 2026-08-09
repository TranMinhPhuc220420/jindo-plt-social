import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { TagSummary } from '@/types';

type Props = {
    children?: ReactNode;
    className?: string;
};

type PageProps = {
    trending_tags?: TagSummary[];
};

export function SocialRightRail({ children, className }: Props) {
    const { trending_tags = [] } = usePage<PageProps>().props;

    return (
        <aside
            className={cn(
                'hidden h-full min-h-0 w-72 shrink-0 overflow-y-auto py-4 pl-2 xl:block',
                className,
            )}
            aria-label="Sidebar"
        >
            {children ?? (
                <div className="space-y-3">
                    <div className="rounded-xl bg-card p-4 shadow-xs">
                        <h2 className="mb-2 text-sm font-semibold">
                            Trending tags
                        </h2>
                        {trending_tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Explore topics in{' '}
                                <Link
                                    href="/explore"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Explore
                                </Link>
                                .
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {trending_tags.map((tag) => (
                                    <li key={tag.id}>
                                        <Link
                                            href={`/t/${tag.slug}`}
                                            className="block rounded-md px-1 py-1 hover:bg-muted"
                                        >
                                            <span className="font-semibold text-primary">
                                                #{tag.slug}
                                            </span>
                                            {tag.posts_count != null ? (
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    {tag.posts_count} posts · 7d
                                                </span>
                                            ) : null}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                        <Link
                            href="/search"
                            className="font-medium text-primary hover:underline"
                        >
                            Search people & posts
                        </Link>
                    </div>
                </div>
            )}
        </aside>
    );
}

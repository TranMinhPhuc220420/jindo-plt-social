import { Form, Head, Link } from '@inertiajs/react';
import { PostCard } from '@/components/posts/post-card';
import { EmptyState } from '@/components/social/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Post, TagSummary } from '@/types';

type SearchUser = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
};

type Props = {
    query: string;
    tab: 'users' | 'posts' | 'tags';
    users: SearchUser[];
    posts: {
        data: Post[];
        next_page_url: string | null;
        prev_page_url: string | null;
    } | null;
    tags: TagSummary[];
};

export default function SearchIndex({
    query,
    tab,
    users,
    posts,
    tags,
}: Props) {
    const getInitials = useInitials();

    const placeholder =
        tab === 'posts'
            ? 'Search posts…'
            : tab === 'tags'
              ? 'Search tags…'
              : 'Search people…';

    return (
        <>
            <Head title="Search" />
            <div className="flex flex-col gap-3">
                <Form
                    method="get"
                    action="/search"
                    className="rounded-lg bg-card p-3 shadow-xs"
                >
                    <input type="hidden" name="tab" value={tab} />
                    <div className="flex gap-2">
                        <Input
                            name="q"
                            defaultValue={query}
                            placeholder={placeholder}
                            className="flex-1"
                            autoFocus
                        />
                        <Button type="submit">Search</Button>
                    </div>
                </Form>

                <div className="flex gap-1 rounded-lg bg-card p-1 shadow-xs">
                    {(
                        [
                            ['users', 'People'],
                            ['posts', 'Posts'],
                            ['tags', 'Tags'],
                        ] as const
                    ).map(([value, label]) => (
                        <Link
                            key={value}
                            href={`/search?tab=${value}&q=${encodeURIComponent(query)}`}
                            className={cn(
                                'flex-1 rounded-md px-3 py-2 text-center text-sm transition-colors',
                                tab === value
                                    ? 'bg-muted font-semibold'
                                    : 'text-muted-foreground hover:bg-muted/50',
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {tab === 'users' ? (
                    <div className="rounded-lg bg-card shadow-xs">
                        {query === '' ? (
                            <EmptyState
                                title="Search people"
                                description="Enter a name or username to find someone."
                            />
                        ) : users.length === 0 ? (
                            <EmptyState
                                title="No people found"
                                description={`Nothing matched “${query}”.`}
                            />
                        ) : (
                            <ul className="divide-y">
                                {users.map((user) => (
                                    <li key={user.id}>
                                        <Link
                                            href={`/u/${user.username}`}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                                        >
                                            <Avatar className="size-10">
                                                <AvatarImage
                                                    src={
                                                        user.avatar ?? undefined
                                                    }
                                                    alt={user.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-semibold leading-tight">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    @{user.username}
                                                </p>
                                                {user.bio ? (
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {user.bio}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : tab === 'tags' ? (
                    <div className="rounded-lg bg-card shadow-xs">
                        {query === '' ? (
                            <EmptyState
                                title="Search tags"
                                description="Enter a topic to find hashtags."
                            />
                        ) : tags.length === 0 ? (
                            <EmptyState
                                title="No tags found"
                                description={`Nothing matched “${query}”.`}
                            />
                        ) : (
                            <ul className="divide-y">
                                {tags.map((tag) => (
                                    <li key={tag.id}>
                                        <Link
                                            href={`/t/${tag.slug}`}
                                            className="block px-3 py-2.5 font-semibold hover:bg-muted/40"
                                        >
                                            #{tag.slug}
                                            {tag.posts_count != null ? (
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    {tag.posts_count} posts
                                                </span>
                                            ) : null}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {query === '' ? (
                            <div className="rounded-lg bg-card shadow-xs">
                                <EmptyState
                                    title="Search posts"
                                    description="Enter keywords to find posts."
                                />
                            </div>
                        ) : !posts || posts.data.length === 0 ? (
                            <div className="rounded-lg bg-card shadow-xs">
                                <EmptyState
                                    title="No posts found"
                                    description={`Nothing matched “${query}”.`}
                                />
                            </div>
                        ) : (
                            posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )}
                        {posts?.next_page_url ? (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link
                                    href={posts.next_page_url}
                                    preserveScroll
                                >
                                    Load more
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </>
    );
}

SearchIndex.layout = {
    breadcrumbs: [],
};

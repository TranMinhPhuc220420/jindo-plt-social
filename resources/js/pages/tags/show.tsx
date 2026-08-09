import { Head, Link } from '@inertiajs/react';
import { PostCard } from '@/components/posts/post-card';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { CursorPaginated, Post, TagSummary } from '@/types';

type Props = {
    tag: TagSummary;
    posts: CursorPaginated<Post>;
};

export default function TagShow({ tag, posts }: Props) {
    return (
        <>
            <Head title={`#${tag.slug}`} />
            <div className="flex flex-col gap-3">
                <header className="rounded-lg bg-card px-4 py-5 shadow-xs">
                    <h1 className="text-2xl font-bold tracking-tight">
                        #{tag.slug}
                    </h1>
                    {tag.posts_count != null ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {tag.posts_count}{' '}
                            {tag.posts_count === 1 ? 'post' : 'posts'}
                        </p>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Posts tagged with this topic
                        </p>
                    )}
                </header>

                {posts.data.length === 0 ? (
                    <section className="rounded-lg bg-card shadow-xs">
                        <EmptyState
                            title="No posts yet"
                            description="Be the first to post with this tag."
                            action={
                                <Button asChild>
                                    <Link href="/feed">Go to feed</Link>
                                </Button>
                            }
                        />
                    </section>
                ) : (
                    <div className="flex flex-col gap-3">
                        {posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                {posts.next_page_url ? (
                    <Button asChild variant="outline" className="w-full">
                        <Link href={posts.next_page_url} preserveScroll>
                            Load more
                        </Link>
                    </Button>
                ) : null}
            </div>
        </>
    );
}

TagShow.layout = {
    breadcrumbs: [],
};

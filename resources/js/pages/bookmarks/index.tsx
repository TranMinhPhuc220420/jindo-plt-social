import { Head, Link } from '@inertiajs/react';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { PostCard } from '@/components/posts/post-card';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { CursorPaginated, Post } from '@/types';

type Props = {
    posts: CursorPaginated<Post>;
};

export default function BookmarksIndex({ posts }: Props) {
    return (
        <>
            <Head title="Saved" />
            <div className="flex flex-col gap-3">
                <h1 className="px-1 text-lg font-semibold tracking-tight">
                    Saved
                </h1>

                {posts.data.length === 0 ? (
                    <section className="rounded-lg bg-card shadow-xs">
                        <EmptyState
                            title="No saved posts yet"
                            description="Bookmark posts from your feed to find them here later."
                            action={
                                <Button asChild>
                                    <Link href="/feed">Browse feed</Link>
                                </Button>
                            }
                        />
                    </section>
                ) : (
                    <Stagger className="flex flex-col gap-3">
                        {posts.data.map((post) => (
                            <StaggerItem key={post.id}>
                                <PostCard post={post} />
                            </StaggerItem>
                        ))}
                    </Stagger>
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

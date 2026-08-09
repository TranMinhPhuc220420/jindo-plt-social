import { Head, InfiniteScroll, Link } from '@inertiajs/react';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { PostCard } from '@/components/posts/post-card';
import { PostComposer } from '@/components/posts/post-composer';
import { EmptyState } from '@/components/social/empty-state';
import { PostSkeleton } from '@/components/social/post-skeleton';
import { Button } from '@/components/ui/button';
import type { CursorPaginated, Post } from '@/types';

type Props = {
    posts: CursorPaginated<Post>;
};

export default function FeedIndex({ posts }: Props) {
    return (
        <>
            <Head title="Home" />
            <div className="flex flex-col gap-3">
                <PostComposer />

                {posts.data.length === 0 ? (
                    <div className="rounded-lg bg-card shadow-xs">
                        <EmptyState
                            title="Your feed is empty"
                            description="Follow people or explore trending posts to fill your Home."
                            action={
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button asChild>
                                        <Link href="/explore">Explore</Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/search">Find people</Link>
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <InfiniteScroll
                        data="posts"
                        buffer={400}
                        onlyNext
                        preserveUrl
                        next={({ loading, hasMore }) =>
                            loading && hasMore ? (
                                <PostSkeleton count={1} className="py-2" />
                            ) : null
                        }
                    >
                        <Stagger className="flex flex-col gap-3">
                            {posts.data.map((post) => (
                                <StaggerItem key={post.id}>
                                    <PostCard post={post} />
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </InfiniteScroll>
                )}
            </div>
        </>
    );
}

import { Head, InfiniteScroll, Link } from '@inertiajs/react';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { PostCard } from '@/components/posts/post-card';
import { EmptyState } from '@/components/social/empty-state';
import { PostSkeleton } from '@/components/social/post-skeleton';
import { Button } from '@/components/ui/button';
import type { Post, TagSummary } from '@/types';

type Props = {
    posts: {
        data: Post[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    trending_tags: TagSummary[];
};

export default function ExploreIndex({ posts, trending_tags }: Props) {
    return (
        <>
            <Head title="Explore" />
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-xl font-bold">Explore</h1>
                    <p className="text-sm text-muted-foreground">
                        Trending notes from the last 48 hours
                    </p>
                </div>

                {trending_tags.length > 0 ? (
                    <section className="rounded-lg bg-card p-3 shadow-xs">
                        <h2 className="mb-2 text-sm font-semibold">
                            Trending tags · last 7 days
                        </h2>
                        <ul className="flex flex-wrap gap-2">
                            {trending_tags.map((tag) => (
                                <li key={tag.id}>
                                    <Link
                                        href={`/t/${tag.slug}`}
                                        className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                                    >
                                        #{tag.slug}
                                        {tag.posts_count != null ? (
                                            <span className="ml-1 text-muted-foreground">
                                                {tag.posts_count}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                <section className="flex flex-col gap-3">
                    {posts.data.length === 0 ? (
                        <EmptyState
                            title="Nothing trending yet"
                            description="Check back soon as members like and comment on posts."
                            action={
                                <Button asChild>
                                    <Link href="/feed">Back to Home</Link>
                                </Button>
                            }
                        />
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
                </section>
            </div>
        </>
    );
}

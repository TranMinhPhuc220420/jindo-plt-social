import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { CommentForm } from '@/components/posts/comment-form';
import { CommentList } from '@/components/posts/comment-list';
import { PostCard } from '@/components/posts/post-card';
import type { Comment, Post } from '@/types';

type Props = {
    post: Post;
    comments: Comment[];
};

export default function PostShow({ post, comments }: Props) {
    return (
        <>
            <Head title={`Post by @${post.user.username}`} />
            <div className="flex flex-col gap-3">
                <Link
                    href="/feed"
                    className="hidden w-fit items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-foreground lg:inline-flex"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Link>

                <PostCard post={post} clampBody={false} />

                <section className="rounded-lg bg-card p-3 shadow-xs">
                    <h2 className="mb-3 text-sm font-semibold">
                        Comments
                        {post.comments_count > 0
                            ? ` · ${post.comments_count}`
                            : ''}
                    </h2>
                    <div className="mb-3">
                        <CommentForm postId={post.id} />
                    </div>
                    <CommentList postId={post.id} comments={comments} />
                </section>
            </div>
        </>
    );
}

PostShow.layout = {
    breadcrumbs: [],
};

import { Link, router } from '@inertiajs/react';
import { MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BookmarkButton } from '@/components/posts/bookmark-button';
import { LikeButton } from '@/components/posts/like-button';
import { PostBody } from '@/components/posts/post-body';
import { PostComposerShell } from '@/components/posts/post-composer-shell';
import { LegacyPostImage, PostMedia } from '@/components/posts/post-media';
import { ShareMenu } from '@/components/posts/share-menu';
import { SharedPostEmbed } from '@/components/posts/shared-post-embed';
import { FollowButton } from '@/components/profile/follow-button';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { relativeTime } from '@/lib/relative-time';
import type { Post } from '@/types';

type Props = {
    post: Post;
    /** When false, post body is never truncated (e.g. post detail). */
    clampBody?: boolean;
};

export function PostCard({ post, clampBody = true }: Props) {
    const getInitials = useInitials();
    const [editing, setEditing] = useState(false);
    const [editSession, setEditSession] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const isShare = post.shared_post !== null;

    function handleDelete(): void {
        setDeleting(true);
        router.delete(`/posts/${post.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setConfirmDelete(false);
            },
        });
    }

    return (
        <article className="relative rounded-lg bg-card shadow-xs">
            <div className="flex items-center gap-2.5 px-3 pt-2.5">
                <Link href={`/u/${post.user.username}`} className="shrink-0">
                    <Avatar className="size-9">
                        <AvatarImage
                            src={post.user.avatar ?? undefined}
                            alt={post.user.name}
                        />
                        <AvatarFallback>
                            {getInitials(post.user.name)}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Link
                                href={`/u/${post.user.username}`}
                                className="truncate text-[15px] font-semibold hover:underline"
                            >
                                {post.user.name}
                            </Link>
                            {post.user.can_follow ? (
                                <>
                                    <span
                                        aria-hidden
                                        className="shrink-0 text-muted-foreground"
                                    >
                                        ·
                                    </span>
                                    <FollowButton
                                        username={post.user.username}
                                        isFollowing={
                                            post.user.followed_by_viewer
                                        }
                                        variant="text"
                                    />
                                </>
                            ) : null}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            <span>@{post.user.username}</span>
                            {post.created_at ? (
                                <>
                                    <span className="mx-1">·</span>
                                    <time dateTime={post.created_at}>
                                        {relativeTime(post.created_at)}
                                    </time>
                                </>
                            ) : null}
                        </div>
                    </div>
                    <div className="-mr-1.5 flex shrink-0 items-center">
                        <BookmarkButton
                            postId={post.id}
                            bookmarked={post.bookmarked_by_viewer}
                            bookmarksCount={post.bookmarks_count ?? 0}
                            className="size-7 px-0"
                        />
                        {(post.can.update || post.can.delete) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0"
                                    >
                                        <MoreHorizontal className="size-4" />
                                        <span className="sr-only">
                                            Post menu
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {post.can.update ? (
                                        <DropdownMenuItem
                                            onSelect={() => {
                                                setEditSession(
                                                    (value) => value + 1,
                                                );
                                                setEditing(true);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                    ) : null}
                                    {post.can.delete ? (
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onSelect={() =>
                                                setConfirmDelete(true)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {post.body ? (
                <div className="px-3">
                    <PostBody body={post.body} clamp={clampBody} />
                </div>
            ) : null}

            {post.shared_post ? (
                <div className="mt-1.5 px-3 pb-1">
                    <SharedPostEmbed shared={post.shared_post} />
                </div>
            ) : post.media?.length > 0 ? (
                <div className="mt-1.5 overflow-hidden">
                    <PostMedia media={post.media} />
                </div>
            ) : post.image_url ? (
                <LegacyPostImage
                    src={post.image_url}
                    className="mt-1.5 overflow-hidden"
                />
            ) : null}

            <div className="flex items-center gap-0.5 px-2 py-0.5">
                <LikeButton
                    postId={post.id}
                    viewerReaction={post.viewer_reaction}
                    likesCount={post.likes_count}
                    reactionCounts={post.reaction_counts}
                    showCount
                    compact
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-muted-foreground"
                    asChild
                >
                    <Link
                        href={`/posts/${post.id}`}
                        aria-label={`Comments, ${post.comments_count} total`}
                    >
                        <MessageCircle className="size-4 shrink-0" />
                        {post.comments_count > 0 ? (
                            <span className="tabular-nums">
                                ({post.comments_count})
                            </span>
                        ) : null}
                    </Link>
                </Button>
                <ShareMenu post={post} showCount compact />
            </div>

            {post.can.update ? (
                <PostComposerShell
                    key={editSession}
                    open={editing}
                    onOpenChange={setEditing}
                    mode="edit"
                    action={`/posts/${post.id}`}
                    defaultBody={post.body}
                    existingMedia={isShare ? [] : (post.media ?? [])}
                    allowMedia={!isShare}
                    allowEmptyBody={isShare}
                />
            ) : null}

            <ConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title="Delete post?"
                description="This cannot be undone."
                confirmLabel="Delete"
                destructive
                processing={deleting}
                onConfirm={handleDelete}
            />
        </article>
    );
}

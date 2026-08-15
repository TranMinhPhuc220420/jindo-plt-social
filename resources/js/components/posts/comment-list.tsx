import { Form, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { CommentForm } from '@/components/posts/comment-form';
import { ReportDialog } from '@/components/posts/report-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { isEmojiOnly } from '@/lib/emoji';
import { renderMentionedText } from '@/lib/mentions';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

type Props = {
    postId: number;
    comments: Comment[];
};

export function CommentList({ postId, comments }: Props) {
    const getInitials = useInitials();
    const reduce = usePrefersReducedMotion();
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [reporting, setReporting] = useState<{
        type: 'comment';
        id: number;
    } | null>(null);

    if (comments.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                No comments yet. Be the first to reply.
            </p>
        );
    }

    return (
        <>
            <ul className="space-y-4">
                {comments.map((comment) => (
                    <li key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                            <Link
                                href={`/u/${comment.user.username}`}
                                className="shrink-0"
                            >
                                <Avatar className="size-8">
                                    <AvatarImage
                                        src={comment.user.avatar ?? undefined}
                                        alt={comment.user.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(comment.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <Link
                                        href={`/u/${comment.user.username}`}
                                        className="text-sm font-medium hover:underline"
                                    >
                                        {comment.user.name}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                        @{comment.user.username}
                                    </span>
                                </div>
                                <p
                                    className={cn(
                                        'text-sm whitespace-pre-wrap',
                                        isEmojiOnly(comment.body) &&
                                            'text-[2rem] leading-none',
                                    )}
                                >
                                    {isEmojiOnly(comment.body)
                                        ? comment.body.trim()
                                        : renderMentionedText(comment.body)}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setReplyingTo(
                                                replyingTo === comment.id
                                                    ? null
                                                    : comment.id,
                                            )
                                        }
                                    >
                                        Reply
                                    </Button>
                                    {comment.can_delete && (
                                        <Form
                                            method="delete"
                                            action={`/comments/${comment.id}`}
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={processing}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                    {comment.can_report ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setReporting({
                                                    type: 'comment',
                                                    id: comment.id,
                                                })
                                            }
                                        >
                                            Report
                                        </Button>
                                    ) : null}
                                </div>
                                <AnimatePresence>
                                    {replyingTo === comment.id ? (
                                        <motion.div
                                            key={`reply-${comment.id}`}
                                            initial={
                                                reduce
                                                    ? false
                                                    : { opacity: 0, height: 0 }
                                            }
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={
                                                reduce
                                                    ? undefined
                                                    : { opacity: 0, height: 0 }
                                            }
                                            className="overflow-hidden"
                                        >
                                            <CommentForm
                                                postId={postId}
                                                parentId={comment.id}
                                                placeholder="Write a reply…"
                                                onSuccess={() =>
                                                    setReplyingTo(null)
                                                }
                                            />
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>
                        {comment.replies.length > 0 && (
                            <ul className="ml-8 space-y-3 border-l border-sidebar-border/70 pl-4 dark:border-sidebar-border">
                                {comment.replies.map((reply) => (
                                    <li key={reply.id} className="flex gap-3">
                                        <Link
                                            href={`/u/${reply.user.username}`}
                                            className="shrink-0"
                                        >
                                            <Avatar className="size-7">
                                                <AvatarImage
                                                    src={
                                                        reply.user.avatar ??
                                                        undefined
                                                    }
                                                    alt={reply.user.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        reply.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                <Link
                                                    href={`/u/${reply.user.username}`}
                                                    className="text-sm font-medium hover:underline"
                                                >
                                                    {reply.user.name}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">
                                                    @{reply.user.username}
                                                </span>
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-sm whitespace-pre-wrap',
                                                    isEmojiOnly(reply.body) &&
                                                        'text-[2rem] leading-none',
                                                )}
                                            >
                                                {isEmojiOnly(reply.body)
                                                    ? reply.body.trim()
                                                    : renderMentionedText(
                                                          reply.body,
                                                      )}
                                            </p>
                                            {reply.can_delete && (
                                                <Form
                                                    method="delete"
                                                    action={`/comments/${reply.id}`}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                            {reply.can_report ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setReporting({
                                                            type: 'comment',
                                                            id: reply.id,
                                                        })
                                                    }
                                                >
                                                    Report
                                                </Button>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <ReportDialog
                open={reporting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setReporting(null);
                    }
                }}
                reportableType="comment"
                reportableId={reporting?.id ?? 0}
            />
        </>
    );
}

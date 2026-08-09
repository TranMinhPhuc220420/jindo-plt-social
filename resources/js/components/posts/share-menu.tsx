import { Link2, MessageCircle, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SharePostDialog } from '@/components/posts/share-post-dialog';
import { ShareToMessageDialog } from '@/components/posts/share-to-message-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Post, SharedPost } from '@/types';

type Props = {
    post: Post;
    compact?: boolean;
    showCount?: boolean;
};

function rootSharePreview(post: Post): SharedPost {
    if (post.shared_post) {
        return post.shared_post;
    }

    return {
        id: post.id,
        body: post.body,
        media: post.media ?? [],
        image_url: post.image_url,
        unavailable: false,
        created_at: post.created_at,
        user: {
            id: post.user.id,
            name: post.user.name,
            username: post.user.username,
            avatar: post.user.avatar,
        },
    };
}

function rootPostId(post: Post): number {
    return post.shared_post?.id ?? post.id;
}

export function ShareMenu({ post, compact = false, showCount = false }: Props) {
    const [feedOpen, setFeedOpen] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);
    const [feedSession, setFeedSession] = useState(0);
    const [messageSession, setMessageSession] = useState(0);
    const preview = useMemo(() => rootSharePreview(post), [post]);
    const targetId = rootPostId(post);
    const sharesCount = post.shares_count ?? 0;

    async function copyLink(): Promise<void> {
        const url = `${window.location.origin}/posts/${targetId}`;

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied.');
        } catch {
            toast.error('Could not copy link.');
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={
                            compact
                                ? 'h-8 gap-1 px-2 text-muted-foreground'
                                : 'gap-1.5 text-muted-foreground'
                        }
                        aria-label={
                            sharesCount > 0
                                ? `Share, ${sharesCount} total`
                                : 'Share'
                        }
                    >
                        <Share2 className="size-4 shrink-0" />
                        {showCount && sharesCount > 0 ? (
                            <span className="tabular-nums">
                                ({sharesCount})
                            </span>
                        ) : null}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        onSelect={() => {
                            setFeedSession((value) => value + 1);
                            setFeedOpen(true);
                        }}
                    >
                        <Share2 className="size-4" />
                        Share to Feed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => {
                            setMessageSession((value) => value + 1);
                            setMessageOpen(true);
                        }}
                    >
                        <MessageCircle className="size-4" />
                        Send in Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void copyLink()}>
                        <Link2 className="size-4" />
                        Copy link
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SharePostDialog
                key={`feed-${feedSession}`}
                open={feedOpen}
                onOpenChange={setFeedOpen}
                postId={targetId}
                sharedPreview={preview}
            />
            <ShareToMessageDialog
                key={`message-${messageSession}`}
                open={messageOpen}
                onOpenChange={setMessageOpen}
                postId={targetId}
                sharedPreview={preview}
            />
        </>
    );
}

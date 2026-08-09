import { Form, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { EmojiPickerButton } from '@/components/emoji/emoji-picker-button';
import { SharedPostEmbed } from '@/components/posts/shared-post-embed';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { insertTextAtCursor } from '@/lib/emoji';
import type { Auth, SharedPost } from '@/types';

const MAX_BODY = 2000;

type PageProps = {
    auth: Auth;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    sharedPreview: SharedPost;
};

export function SharePostDialog({
    open,
    onOpenChange,
    postId,
    sharedPreview,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [body, setBody] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        document.documentElement.setAttribute('data-composer-open', 'true');

        return () => {
            document.documentElement.removeAttribute('data-composer-open');
        };
    }, [open]);

    function insertEmoji(emoji: string): void {
        const el = textareaRef.current;

        if (!el) {
            setBody((current) => current + emoji);

            return;
        }

        const { value, selectionStart } = insertTextAtCursor(el, emoji);
        setBody(value);

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(selectionStart, selectionStart);
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
                <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle>Share</DialogTitle>
                    <DialogDescription className="sr-only">
                        Share this post to your feed
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={`/posts/${postId}/share`}
                    method="post"
                    className="flex flex-col gap-3 p-4"
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ processing }) => (
                        <>
                            <div className="flex gap-2.5">
                                <Avatar className="size-10 shrink-0">
                                    <AvatarImage
                                        src={user.avatar ?? undefined}
                                        alt={user.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold">
                                        {user.name}
                                    </p>
                                    <textarea
                                        ref={textareaRef}
                                        name="body"
                                        value={body}
                                        onChange={(event) =>
                                            setBody(event.target.value)
                                        }
                                        maxLength={MAX_BODY}
                                        rows={3}
                                        placeholder="Say something about this…"
                                        className="mt-1 w-full resize-none border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                                    />
                                    <div className="mt-1 flex items-center justify-between">
                                        <EmojiPickerButton
                                            onSelect={insertEmoji}
                                        />
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {body.length}/{MAX_BODY}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <SharedPostEmbed shared={sharedPreview} />

                            <div className="flex justify-end border-t border-border pt-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-24"
                                >
                                    {processing ? <Spinner /> : 'Post'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

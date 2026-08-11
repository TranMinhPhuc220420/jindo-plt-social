import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { EmojiPickerButton } from '@/components/emoji/emoji-picker-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { insertTextAtCursor } from '@/lib/emoji';
import { cn } from '@/lib/utils';

type Props = {
    postId: number;
    parentId?: number | null;
    placeholder?: string;
    onSuccess?: () => void;
};

export function CommentForm({
    postId,
    parentId = null,
    placeholder = 'Write a comment…',
    onSuccess,
}: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [body, setBody] = useState('');

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
        <Form
            method="post"
            action={`/posts/${postId}/comments`}
            resetOnSuccess
            options={{ preserveScroll: true }}
            onSuccess={() => {
                setBody('');
                onSuccess?.();
            }}
            className="space-y-2"
        >
            {({ processing, errors }) => (
                <>
                    {parentId !== null && (
                        <input
                            type="hidden"
                            name="parent_id"
                            value={parentId}
                        />
                    )}
                    <div className="grid gap-1">
                        <Label
                            htmlFor={`comment-body-${postId}-${parentId ?? 'root'}`}
                            className="sr-only"
                        >
                            Comment
                        </Label>
                        <textarea
                            ref={textareaRef}
                            id={`comment-body-${postId}-${parentId ?? 'root'}`}
                            name="body"
                            required
                            rows={2}
                            maxLength={1000}
                            placeholder={placeholder}
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            className={cn(
                                'flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground',
                                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            )}
                        />
                        <InputError message={errors.body} />
                        <InputError message={errors.parent_id} />
                    </div>
                    <div className="flex items-center gap-1">
                        <EmojiPickerButton
                            className="size-8"
                            onSelect={insertEmoji}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || body.trim().length === 0}
                        >
                            {processing && <Spinner />}
                            Reply
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

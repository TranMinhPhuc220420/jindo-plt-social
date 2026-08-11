import { Form, usePage } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { EmojiPickerButton } from '@/components/emoji/emoji-picker-button';
import InputError from '@/components/input-error';
import {
    MAX_POST_IMAGES,
    MediaUploader,
} from '@/components/posts/media-uploader';
import { ConfirmDialog } from '@/components/social/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { insertTextAtCursor } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import type { Auth, PostMediaItem } from '@/types';

const MAX_BODY = 2000;

type PageProps = {
    auth: Auth;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    /** Form action URL. */
    action: string;
    defaultBody?: string;
    existingMedia?: PostMediaItem[];
    /** Called after a successful submit. */
    onSuccess?: () => void;
    /** When false, hide media uploader (e.g. share caption edit). */
    allowMedia?: boolean;
    /** When true, empty body can submit (share captions). */
    allowEmptyBody?: boolean;
};

/**
 * Shared Facebook-like create/edit post dialog.
 * Remount (via parent `key`) when opening to reset form state.
 */
export function PostComposerShell({
    open,
    onOpenChange,
    mode,
    action,
    defaultBody = '',
    existingMedia = [],
    onSuccess,
    allowMedia = true,
    allowEmptyBody = false,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pickerId = useId();
    const [body, setBody] = useState(defaultBody);
    const [removeIds, setRemoveIds] = useState<number[]>([]);
    const [newFileCount, setNewFileCount] = useState(0);
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const title = mode === 'create' ? 'Create post' : 'Edit post';
    const submitLabel = mode === 'create' ? 'Post' : 'Save';
    const bodyLength = body.length;
    const keptExisting = existingMedia.filter(
        (item) => !removeIds.includes(item.id),
    );
    const slotsLeft = Math.max(
        0,
        MAX_POST_IMAGES - keptExisting.length - newFileCount,
    );
    const isDirty =
        body !== defaultBody || removeIds.length > 0 || newFileCount > 0;
    const canSubmit = allowEmptyBody || body.trim().length > 0;

    useEffect(() => {
        if (!open) {
            return;
        }

        document.documentElement.setAttribute('data-composer-open', 'true');

        return () => {
            document.documentElement.removeAttribute('data-composer-open');
        };
    }, [open]);

    function requestClose(): void {
        if (isDirty) {
            setConfirmDiscard(true);

            return;
        }

        onOpenChange(false);
    }

    function handleOpenChange(next: boolean): void {
        if (next) {
            onOpenChange(true);

            return;
        }

        requestClose();
    }

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
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className={cn(
                        'flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg',
                        'max-lg:top-auto max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:max-h-[min(92dvh,800px)] max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-t-2xl max-lg:rounded-b-none',
                    )}
                    onPointerDownOutside={(event) => {
                        if (isDirty) {
                            event.preventDefault();
                            setConfirmDiscard(true);
                        }
                    }}
                    onEscapeKeyDown={(event) => {
                        if (isDirty) {
                            event.preventDefault();
                            setConfirmDiscard(true);
                        }
                    }}
                >
                    <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12 text-left">
                        <DialogTitle className="text-center text-base sm:text-left">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {mode === 'create'
                                ? 'Compose a new post with text and photos.'
                                : 'Update your post text and photos.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        method="post"
                        action={action}
                        encType="multipart/form-data"
                        resetOnSuccess={mode === 'create'}
                        options={{ preserveScroll: true }}
                        className="flex min-h-0 flex-1 flex-col"
                        onSuccess={() => {
                            onOpenChange(false);
                            onSuccess?.();
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                {mode === 'edit' ? (
                                    <input
                                        type="hidden"
                                        name="_method"
                                        value="patch"
                                    />
                                ) : null}

                                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="size-10 shrink-0">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 leading-tight">
                                            <p className="truncate font-semibold">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </div>

                                    <Label
                                        htmlFor={`composer-body-${mode}`}
                                        className="sr-only"
                                    >
                                        Post body
                                    </Label>
                                    <textarea
                                        ref={textareaRef}
                                        id={`composer-body-${mode}`}
                                        name="body"
                                        rows={5}
                                        maxLength={MAX_BODY}
                                        autoFocus
                                        placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
                                        value={body}
                                        onChange={(event) =>
                                            setBody(event.target.value)
                                        }
                                        className={cn(
                                            'min-h-28 w-full resize-none border-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground',
                                            'focus-visible:ring-0',
                                        )}
                                    />
                                    <InputError message={errors.body} />
                                    <p className="text-xs text-muted-foreground">
                                        Markdown: **bold**, lists, links. No
                                        images or HTML.
                                    </p>

                                    {allowMedia ? (
                                        <MediaUploader
                                            errors={errors}
                                            existingMedia={existingMedia}
                                            removeIds={removeIds}
                                            onRemoveIdsChange={setRemoveIds}
                                            pickerId={pickerId}
                                            hidePickerLabel
                                            onNewFilesChange={setNewFileCount}
                                        />
                                    ) : null}
                                </div>

                                <div className="shrink-0 space-y-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
                                        <p className="px-1 text-sm font-medium">
                                            Add to your post
                                        </p>
                                        <div className="flex items-center gap-0.5">
                                            {allowMedia ? (
                                                <Label
                                                    htmlFor={pickerId}
                                                    className={cn(
                                                        'inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-green-600 hover:bg-muted',
                                                        slotsLeft === 0 &&
                                                            'pointer-events-none opacity-40',
                                                    )}
                                                    aria-label="Add photos"
                                                >
                                                    <ImagePlus className="size-5" />
                                                </Label>
                                            ) : null}
                                            <EmojiPickerButton
                                                onSelect={insertEmoji}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={cn(
                                                'text-xs text-muted-foreground',
                                                bodyLength > MAX_BODY - 100 &&
                                                    'text-amber-600',
                                                bodyLength >= MAX_BODY &&
                                                    'text-destructive',
                                            )}
                                        >
                                            {bodyLength}/{MAX_BODY}
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={processing || !canSubmit}
                                            className="min-w-24"
                                        >
                                            {processing ? (
                                                <Spinner />
                                            ) : (
                                                submitLabel
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDiscard}
                onOpenChange={setConfirmDiscard}
                title="Discard changes?"
                description="Your changes will be lost."
                confirmLabel="Discard"
                cancelLabel="Keep editing"
                destructive
                onConfirm={() => {
                    setConfirmDiscard(false);
                    onOpenChange(false);
                }}
            />
        </>
    );
}

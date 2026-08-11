import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { EmojiPickerButton } from '@/components/emoji/emoji-picker-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { insertTextAtCursor } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import { store as storeMessage } from '@/routes/messages/messages';
import type { ChatMessage, MessageUser } from '@/types';

type Props = {
    conversationId: number;
    self: MessageUser;
    /** Called with true while the draft is non-empty; false on clear/send/blur. */
    onTypingChange?: (isTyping: boolean) => void;
    onOptimistic?: (message: ChatMessage) => void;
    onConfirmed?: (message: ChatMessage, clientId: number) => void;
    onFailed?: (clientId: number) => void;
    onSent?: () => void;
};

function xsrfToken(): string | undefined {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : undefined;
}

let tempIdSeq = -1;

export function MessageComposer({
    conversationId,
    self,
    onTypingChange,
    onOptimistic,
    onConfirmed,
    onFailed,
    onSent,
}: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [body, setBody] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [hasFile, setHasFile] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ body?: string; image?: string }>({});

    useEffect(() => {
        // Desktop only — autofocus on mobile opens the soft keyboard immediately.
        if (window.matchMedia('(min-width: 768px)').matches) {
            textareaRef.current?.focus();
        }
    }, [conversationId]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const clearImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setHasFile(false);

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const resizeTextarea = () => {
        const el = textareaRef.current;

        if (!el) {
            return;
        }

        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const insertEmoji = (emoji: string) => {
        const el = textareaRef.current;

        if (!el) {
            setBody((current) => current + emoji);
            onTypingChange?.(true);

            return;
        }

        const { value, selectionStart } = insertTextAtCursor(el, emoji);
        setBody(value);
        onTypingChange?.(value.trim().length > 0);

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(selectionStart, selectionStart);
            resizeTextarea();
        });
    };

    const canSend = body.trim().length > 0 || hasFile;

    const resetComposer = (options?: { revokePreview?: boolean }) => {
        setBody('');
        setHasFile(false);
        onTypingChange?.(false);
        setErrors({});

        if (fileRef.current) {
            fileRef.current.value = '';
        }

        setPreviewUrl((url) => {
            if (url && options?.revokePreview !== false) {
                URL.revokeObjectURL(url);
            }

            return null;
        });

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
            resizeTextarea();
        });
    };

    const send = async () => {
        if (processing || !canSend) {
            return;
        }

        const trimmed = body.trim();
        const file = fileRef.current?.files?.[0] ?? null;
        const clientId = tempIdSeq--;
        const localPreview = previewUrl;

        const optimistic: ChatMessage = {
            id: clientId,
            body: trimmed.length > 0 ? trimmed : null,
            image_url: localPreview,
            shared_post: null,
            read_at: null,
            created_at: new Date().toISOString(),
            user: self,
            is_mine: true,
        };

        onOptimistic?.(optimistic);
        // Keep blob URL alive for the optimistic bubble until confirm/fail.
        resetComposer({ revokePreview: false });
        onSent?.();
        setProcessing(true);

        const formData = new FormData();

        if (trimmed.length > 0) {
            formData.append('body', trimmed);
        }

        if (file) {
            formData.append('image', file);
        }

        const token = xsrfToken();

        const releasePreview = () => {
            if (localPreview) {
                URL.revokeObjectURL(localPreview);
            }
        };

        try {
            const response = await fetch(storeMessage.url(conversationId), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-XSRF-TOKEN': token } : {}),
                },
                credentials: 'same-origin',
                body: formData,
            });

            if (response.status === 422) {
                const payload = (await response.json()) as {
                    message?: string;
                    errors?: Record<string, string[]>;
                };

                onFailed?.(clientId);
                releasePreview();
                setBody(trimmed);
                setErrors({
                    body: payload.errors?.body?.[0],
                    image: payload.errors?.image?.[0],
                });
                toast.error(payload.message ?? 'Could not send message.');

                return;
            }

            if (!response.ok) {
                onFailed?.(clientId);
                releasePreview();
                setBody(trimmed);
                toast.error('Could not send message.');

                return;
            }

            const message = (await response.json()) as ChatMessage;
            onConfirmed?.(message, clientId);
            releasePreview();
        } catch {
            onFailed?.(clientId);
            releasePreview();
            setBody(trimmed);
            toast.error('Could not send message.');
        } finally {
            setProcessing(false);
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
                resizeTextarea();
            });
        }
    };

    return (
        <form
            className="shrink-0 border-t bg-card px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            onSubmit={(event) => {
                event.preventDefault();
                void send();
            }}
        >
            <div className="space-y-1.5">
                {previewUrl ? (
                    <div className="relative ml-11 inline-block">
                        <img
                            src={previewUrl}
                            alt=""
                            className="max-h-20 rounded-lg object-cover"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm"
                            aria-label="Remove photo"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ) : null}

                <div className="flex items-end gap-1">
                    <label className="mb-0.5 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <ImagePlus className="size-5" />
                        <span className="sr-only">Attach photo</span>
                        <input
                            ref={fileRef}
                            name="image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => {
                                const nextFile = event.target.files?.[0];

                                if (previewUrl) {
                                    URL.revokeObjectURL(previewUrl);
                                }

                                if (!nextFile) {
                                    setPreviewUrl(null);
                                    setHasFile(false);

                                    return;
                                }

                                setHasFile(true);
                                setPreviewUrl(URL.createObjectURL(nextFile));
                            }}
                        />
                    </label>

                    <EmojiPickerButton
                        className="mb-0.5 size-11"
                        onSelect={insertEmoji}
                    />

                    <textarea
                        ref={textareaRef}
                        name="body"
                        rows={1}
                        maxLength={2000}
                        placeholder="Aa"
                        value={body}
                        onChange={(event) => {
                            const next = event.target.value;
                            setBody(next);
                            onTypingChange?.(next.trim().length > 0);
                            resizeTextarea();
                        }}
                        onBlur={() => {
                            window.setTimeout(() => {
                                if (
                                    document.activeElement !==
                                    textareaRef.current
                                ) {
                                    onTypingChange?.(false);
                                }
                            }, 120);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();

                                if (!processing && canSend) {
                                    onTypingChange?.(false);
                                    void send();
                                }
                            }
                        }}
                        className={cn(
                            'max-h-[120px] min-h-11 flex-1 resize-none rounded-2xl border-0 bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground',
                            'focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                    />

                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        disabled={processing || !canSend}
                        className={cn(
                            'mb-0.5 size-11 shrink-0 rounded-full',
                            canSend
                                ? 'text-primary hover:bg-primary/10 hover:text-primary'
                                : 'text-muted-foreground',
                        )}
                        aria-label="Send"
                    >
                        {processing ? (
                            <Spinner />
                        ) : (
                            <SendHorizontal className="size-5" />
                        )}
                    </Button>
                </div>

                <InputError message={errors.body || errors.image} />
            </div>
        </form>
    );
}

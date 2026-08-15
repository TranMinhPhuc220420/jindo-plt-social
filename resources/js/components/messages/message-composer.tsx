import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { EmojiPickerButton } from '@/components/emoji/emoji-picker-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { insertTextAtCursor } from '@/lib/emoji';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
    allocateConversationMessageId,
    isFirebaseDmEnabled,
    publishLiveConversationMessage,
    removeLiveConversationMessage,
} from '@/lib/realtime';
import { cn } from '@/lib/utils';
import type { ChatMessage, MessageUser } from '@/types';

type Props = {
    conversationId: string;
    self: MessageUser;
    otherUser: MessageUser;
    /** Called with true while the draft is non-empty; false on clear/send/blur. */
    onTypingChange?: (isTyping: boolean) => void;
    onOptimistic?: (message: ChatMessage) => void;
    onConfirmed?: (message: ChatMessage, clientId: string) => void;
    onFailed?: (clientId: string) => void;
    onSent?: () => void;
};

function xsrfToken(): string | undefined {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : undefined;
}

export function MessageComposer({
    conversationId,
    self,
    otherUser,
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
    const [errors, setErrors] = useState<{ body?: string; image?: string }>({});
    const bodyRef = useRef(body);

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
            bodyRef.current = bodyRef.current + emoji;
            setBody(bodyRef.current);
            onTypingChange?.(true);

            return;
        }

        const { value, selectionStart } = insertTextAtCursor(el, emoji);
        bodyRef.current = value;
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
        bodyRef.current = '';
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
        const trimmed = bodyRef.current.trim();
        const file = fileRef.current?.files?.[0] ?? null;

        if (trimmed.length === 0 && file === null) {
            return;
        }

        bodyRef.current = '';

        // Reserve the RTDB key now so the optimistic bubble and the echo of our
        // own write share one id instead of rendering as two messages.
        const optimisticId =
            allocateConversationMessageId(conversationId) ??
            `opt-${crypto.randomUUID()}`;
        const localPreview = previewUrl;
        const createdAt = new Date().toISOString();

        const optimistic: ChatMessage = {
            id: optimisticId,
            client_id: optimisticId,
            conversation_id: conversationId,
            body: trimmed.length > 0 ? trimmed : null,
            image_url: localPreview,
            shared_post: null,
            read_at: null,
            created_at: createdAt,
            at: Date.now(),
            user: self,
            is_mine: true,
        };

        onOptimistic?.(optimistic);
        resetComposer({ revokePreview: false });
        onSent?.();

        const releasePreview = () => {
            if (localPreview) {
                URL.revokeObjectURL(localPreview);
            }
        };

        let liveClientId: string | null = null;

        const failSend = async () => {
            onFailed?.(optimisticId);

            if (liveClientId) {
                await removeLiveConversationMessage(
                    conversationId,
                    liveClientId,
                );
            }

            releasePreview();
        };

        if (!isFirebaseDmEnabled() || !isFirebaseConfigured()) {
            await failSend();
            toast.error('Messages need Firebase to send.');

            return;
        }

        try {
            let imageUrl: string | null = null;

            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const token = xsrfToken();
                const response = await fetch('/messages/media', {
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

                    await failSend();
                    toast.error(payload.message ?? 'Could not upload photo.');

                    return;
                }

                if (!response.ok) {
                    await failSend();
                    toast.error('Could not upload photo.');

                    return;
                }

                const uploaded = (await response.json()) as {
                    image_url?: string;
                };
                imageUrl = uploaded.image_url ?? null;

                if (!imageUrl) {
                    await failSend();
                    toast.error('Could not upload photo.');

                    return;
                }
            }

            liveClientId = await publishLiveConversationMessage({
                conversation_id: conversationId,
                client_id: optimisticId,
                body: trimmed.length > 0 ? trimmed : null,
                image_url: imageUrl,
                created_at: createdAt,
                user: self,
                other_user: otherUser,
            });

            if (!liveClientId) {
                await failSend();
                toast.error('Could not send message.');

                return;
            }

            onConfirmed?.(
                {
                    ...optimistic,
                    id: liveClientId,
                    client_id: liveClientId,
                    image_url: imageUrl ?? optimistic.image_url,
                },
                optimisticId,
            );
            releasePreview();
        } catch {
            await failSend();
            toast.error('Could not send message.');
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
                            bodyRef.current = next;
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

                                if (canSend) {
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
                        disabled={!canSend}
                        className={cn(
                            'mb-0.5 size-11 shrink-0 rounded-full',
                            canSend
                                ? 'text-primary hover:bg-primary/10 hover:text-primary'
                                : 'text-muted-foreground',
                        )}
                        aria-label="Send"
                    >
                        <SendHorizontal className="size-5" />
                    </Button>
                </div>

                <InputError message={errors.body || errors.image} />
            </div>
        </form>
    );
}

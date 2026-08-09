import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { TypingIndicator } from '@/components/messages/typing-indicator';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { SharedPostEmbed } from '@/components/posts/shared-post-embed';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import { isEmojiOnly } from '@/lib/emoji';
import {
    clusterBubbleRadius,
    getMessageClusterMeta,
} from '@/lib/message-cluster';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const NEAR_BOTTOM_PX = 80;

type Props = {
    messages: ChatMessage[];
    /** Bump after own send to force scroll to bottom */
    scrollToken?: number;
    typingName?: string | null;
};

export function MessageThread({
    messages,
    scrollToken = 0,
    typingName = null,
}: Props) {
    const reduce = usePrefersReducedMotion();
    const scrollerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const prevLengthRef = useRef(messages.length);
    const [animateNew, setAnimateNew] = useState(false);
    const [showNewChip, setShowNewChip] = useState(false);

    /**
     * Scroll only the thread scroller — never scrollIntoView (that walks
     * ancestors and yanks the document when near the bottom).
     */
    const jumpToBottom = (behavior: ScrollBehavior = 'auto') => {
        const el = scrollerRef.current;

        if (!el) {
            return;
        }

        nearBottomRef.current = true;

        if (behavior === 'smooth' && !reduce) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        } else {
            el.scrollTop = el.scrollHeight;
        }
    };

    const onScroll = () => {
        const el = scrollerRef.current;

        if (!el) {
            return;
        }

        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        const near = distance < NEAR_BOTTOM_PX;
        nearBottomRef.current = near;

        if (near) {
            setShowNewChip(false);
        }
    };

    useEffect(() => {
        const scroller = scrollerRef.current;
        const content = contentRef.current;

        jumpToBottom('auto');
        queueMicrotask(() => setAnimateNew(true));

        if (!scroller || !content) {
            return;
        }

        // Images (and other async layout) grow scrollHeight after the initial
        // jump — keep pinned to bottom while the user hasn't scrolled up.
        const ro = new ResizeObserver(() => {
            if (nearBottomRef.current) {
                scroller.scrollTop = scroller.scrollHeight;
            }
        });
        ro.observe(content);

        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / conversation remount only
    }, []);

    useEffect(() => {
        if (scrollToken > 0) {
            jumpToBottom('auto');
            queueMicrotask(() => setShowNewChip(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToken]);

    useEffect(() => {
        const grew = messages.length > prevLengthRef.current;
        const last = messages[messages.length - 1];
        prevLengthRef.current = messages.length;

        if (!grew || !last) {
            return;
        }

        if (last.is_mine || nearBottomRef.current) {
            jumpToBottom('auto');
            queueMicrotask(() => setShowNewChip(false));
        } else {
            queueMicrotask(() => setShowNewChip(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length]);

    useEffect(() => {
        if (typingName && nearBottomRef.current) {
            jumpToBottom('auto');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typingName]);

    return (
        <div className="relative min-h-0 flex-1">
            <div
                ref={scrollerRef}
                onScroll={onScroll}
                className="h-full overflow-y-auto p-4 [overflow-anchor:none]"
            >
                <div ref={contentRef}>
                    {messages.length === 0 ? (
                        <EmptyState
                            title="Say hello"
                            description="Send the first message to start the conversation."
                            className="py-16"
                        />
                    ) : (
                        messages.map((message, index) => {
                            const cluster = getMessageClusterMeta(
                                messages,
                                index,
                            );
                            const animateEnter = !reduce && animateNew;

                            return (
                                <div key={message.id}>
                                    {cluster.showDaySeparator &&
                                    cluster.dayLabel ? (
                                        <div className="flex justify-center py-3">
                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                {cluster.dayLabel}
                                            </span>
                                        </div>
                                    ) : null}
                                    <motion.div
                                        initial={
                                            animateEnter
                                                ? {
                                                      opacity: 0,
                                                      x: message.is_mine
                                                          ? 16
                                                          : -16,
                                                  }
                                                : false
                                        }
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 420,
                                            damping: 32,
                                        }}
                                        className={cn(
                                            'flex flex-col',
                                            message.is_mine
                                                ? 'items-end'
                                                : 'items-start',
                                            cluster.isFirstInGroup &&
                                                !cluster.showDaySeparator
                                                ? 'mt-3'
                                                : cluster.isFirstInGroup
                                                  ? 'mt-0'
                                                  : 'mt-0.5',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[80%] text-sm',
                                                isEmojiOnly(message.body) &&
                                                    !message.image_url &&
                                                    !message.shared_post
                                                    ? 'px-1 py-0.5'
                                                    : cn(
                                                          'px-3 py-2',
                                                          clusterBubbleRadius(
                                                              message.is_mine,
                                                              cluster.isFirstInGroup,
                                                              cluster.isLastInGroup,
                                                          ),
                                                          message.is_mine
                                                              ? 'bg-primary text-primary-foreground'
                                                              : 'bg-muted',
                                                      ),
                                            )}
                                        >
                                            {message.body ? (
                                                <p
                                                    className={cn(
                                                        'whitespace-pre-wrap',
                                                        isEmojiOnly(
                                                            message.body,
                                                        ) &&
                                                            !message.image_url &&
                                                            !message.shared_post &&
                                                            'text-[3.25rem] leading-none',
                                                    )}
                                                >
                                                    {message.body}
                                                </p>
                                            ) : null}
                                            {message.image_url ? (
                                                <img
                                                    src={message.image_url}
                                                    alt=""
                                                    className="mt-1 max-h-48 rounded-lg object-cover"
                                                />
                                            ) : null}
                                            {message.shared_post ? (
                                                <SharedPostEmbed
                                                    shared={
                                                        message.shared_post
                                                    }
                                                    variant="snippet"
                                                    className={cn(
                                                        'mt-1.5',
                                                        message.is_mine
                                                            ? 'border-primary-foreground/25 bg-primary-foreground/10'
                                                            : undefined,
                                                    )}
                                                />
                                            ) : null}
                                        </div>
                                        {cluster.showMeta ? (
                                            <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                                                {!message.is_mine ? (
                                                    <span>
                                                        @{message.user.username}
                                                    </span>
                                                ) : null}
                                                {message.created_at ? (
                                                    <time
                                                        dateTime={
                                                            message.created_at
                                                        }
                                                    >
                                                        {new Date(
                                                            message.created_at,
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </time>
                                                ) : null}
                                                {message.is_mine &&
                                                message.read_at ? (
                                                    <span>Seen</span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </motion.div>
                                </div>
                            );
                        })
                    )}
                    <div className="mt-1">
                        <TypingIndicator
                            name={typingName}
                            variant="bubble"
                        />
                    </div>
                </div>
            </div>

            {showNewChip ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                    <Button
                        type="button"
                        size="sm"
                        className="pointer-events-auto shadow-md"
                        onClick={() => {
                            jumpToBottom('smooth');
                            setShowNewChip(false);
                        }}
                    >
                        New messages ↓
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

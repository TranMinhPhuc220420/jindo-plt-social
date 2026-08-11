import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { ReactionIcon } from '@/components/posts/reaction-icons';
import {
    emptyReactionCounts,
    isReactionType,
    REACTION_META,
    REACTION_TYPES,
    topReactions,
} from '@/lib/reactions';
import type { ReactionCounts, ReactionType } from '@/lib/reactions';
import { cn } from '@/lib/utils';

type Props = {
    postId: number;
    viewerReaction: ReactionType | null;
    likesCount: number;
    reactionCounts?: ReactionCounts;
    showCount?: boolean;
    /** Icon + (count) only — no text label or reaction stack. */
    compact?: boolean;
    className?: string;
};

type ApiResponse = {
    viewer_reaction: string | null;
    liked: boolean;
    likes_count: number;
    reaction_counts: ReactionCounts;
};

type Burst = { id: number; x: number; y: number; color: string };

const LONG_PRESS_MS = 380;

function xsrfToken(): string | undefined {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

export function LikeButton({
    postId,
    viewerReaction: initialReaction,
    likesCount: initialCount,
    reactionCounts: initialCounts,
    showCount = true,
    compact = false,
    className,
}: Props) {
    const reduce = usePrefersReducedMotion();
    const [reaction, setReaction] = useState<ReactionType | null>(
        initialReaction,
    );
    const [likesCount, setLikesCount] = useState(initialCount);
    const [counts, setCounts] = useState<ReactionCounts>(
        initialCounts ?? emptyReactionCounts(),
    );
    const [processing, setProcessing] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hoveredType, setHoveredType] = useState<ReactionType | null>(null);
    const [popKey, setPopKey] = useState(0);
    const [bursts, setBursts] = useState<Burst[]>([]);
    const rootRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<number | null>(null);
    const suppressClick = useRef(false);
    const closeTimer = useRef<number | null>(null);

    useEffect(() => {
        function onPointerDown(event: PointerEvent): void {
            if (!rootRef.current?.contains(event.target as Node)) {
                setPickerOpen(false);
                setHoveredType(null);
            }
        }

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    function clearLongPress(): void {
        if (longPressTimer.current !== null) {
            window.clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }

    function openPicker(): void {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }

        setPickerOpen(true);
    }

    function scheduleClosePicker(): void {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current);
        }

        closeTimer.current = window.setTimeout(() => {
            setPickerOpen(false);
            setHoveredType(null);
        }, 120);
    }

    function spawnBurst(color: string): void {
        if (reduce) {
            return;
        }

        const next = Array.from({ length: 6 }, (_, i) => ({
            id: Date.now() + i,
            x: (Math.random() - 0.5) * 48,
            y: -10 - Math.random() * 36,
            color,
        }));
        setBursts(next);
        window.setTimeout(() => setBursts([]), 520);
    }

    async function sendReaction(next: ReactionType | null): Promise<void> {
        if (processing) {
            return;
        }

        setProcessing(true);

        const method = next === null ? 'DELETE' : 'POST';
        const token = xsrfToken();

        try {
            const response = await fetch(`/posts/${postId}/like`, {
                method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(token) }
                        : {}),
                },
                credentials: 'same-origin',
                body:
                    next === null ? undefined : JSON.stringify({ type: next }),
            });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as ApiResponse;
            const resolved = isReactionType(data.viewer_reaction)
                ? data.viewer_reaction
                : null;

            if (resolved) {
                setPopKey((value) => value + 1);
                spawnBurst(REACTION_META[resolved].color);
            }

            setReaction(resolved);
            setLikesCount(data.likes_count);
            setCounts({
                ...emptyReactionCounts(),
                ...data.reaction_counts,
            });
        } finally {
            setProcessing(false);
            setPickerOpen(false);
            setHoveredType(null);
        }
    }

    function onMainClick(): void {
        if (suppressClick.current) {
            suppressClick.current = false;

            return;
        }

        if (reaction) {
            void sendReaction(null);
        } else {
            void sendReaction('like');
        }
    }

    function onPickerSelect(type: ReactionType): void {
        suppressClick.current = true;
        void sendReaction(type);
    }

    const meta = reaction ? REACTION_META[reaction] : null;
    const community = topReactions(counts, 3);

    return (
        <div
            ref={rootRef}
            className={cn(
                'relative inline-flex justify-center',
                pickerOpen && 'z-50',
                className,
            )}
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClosePicker}
        >
            <AnimatePresence>
                {pickerOpen ? (
                    <motion.div
                        initial={
                            reduce ? false : { opacity: 0, y: 12, scale: 0.85 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            reduce
                                ? undefined
                                : { opacity: 0, y: 8, scale: 0.9 }
                        }
                        transition={{
                            type: 'spring',
                            stiffness: 520,
                            damping: 28,
                            mass: 0.7,
                        }}
                        className="absolute bottom-full left-0 z-50 mb-1.5 origin-bottom-left"
                        role="listbox"
                        aria-label="Choose reaction"
                        onMouseEnter={openPicker}
                        onMouseLeave={scheduleClosePicker}
                    >
                        <div className="relative flex items-end gap-0.5 rounded-full border bg-card px-1.5 py-1 shadow-lg">
                            {REACTION_TYPES.map((type, index) => {
                                const item = REACTION_META[type];
                                const active = reaction === type;
                                const hovered = hoveredType === type;

                                return (
                                    <div
                                        key={type}
                                        className="relative flex flex-col items-center"
                                    >
                                        <AnimatePresence>
                                            {hovered ? (
                                                <motion.span
                                                    initial={
                                                        reduce
                                                            ? false
                                                            : {
                                                                  opacity: 0,
                                                                  y: 4,
                                                              }
                                                    }
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0, y: 2 }}
                                                    className="absolute -top-7 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap text-background"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            ) : null}
                                        </AnimatePresence>
                                        <motion.button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            aria-label={item.label}
                                            disabled={processing}
                                            initial={
                                                reduce
                                                    ? false
                                                    : {
                                                          opacity: 0,
                                                          y: 10,
                                                          scale: 0.5,
                                                      }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: hovered ? -10 : 0,
                                                scale: hovered
                                                    ? 1.45
                                                    : active
                                                      ? 1.08
                                                      : 1,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 22,
                                                delay: reduce
                                                    ? 0
                                                    : index * 0.03,
                                            }}
                                            className="relative flex size-10 items-center justify-center rounded-full outline-none"
                                            style={
                                                active
                                                    ? {
                                                          boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${item.color}`,
                                                      }
                                                    : undefined
                                            }
                                            onMouseEnter={() =>
                                                setHoveredType(type)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredType(null)
                                            }
                                            onClick={() => onPickerSelect(type)}
                                        >
                                            <ReactionIcon
                                                type={type}
                                                className="size-9 drop-shadow-sm"
                                            />
                                        </motion.button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <motion.button
                type="button"
                disabled={processing}
                data-test="like-button"
                aria-label={
                    reaction
                        ? `${meta?.label ?? 'Reacted'}, ${likesCount} total`
                        : `Like, ${likesCount} total`
                }
                whileTap={reduce ? undefined : { scale: 0.92 }}
                className={cn(
                    'relative inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent',
                    !compact &&
                        'w-full gap-1.5 px-2 py-1.5 font-semibold sm:px-3',
                    meta?.activeClass,
                )}
                onClick={onMainClick}
                onPointerDown={() => {
                    clearLongPress();
                    longPressTimer.current = window.setTimeout(() => {
                        suppressClick.current = true;
                        openPicker();
                    }, LONG_PRESS_MS);
                }}
                onPointerUp={clearLongPress}
                onPointerCancel={clearLongPress}
                onPointerLeave={clearLongPress}
            >
                <motion.span
                    key={popKey}
                    initial={reduce ? false : { scale: 0.4, rotate: -18 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 560,
                        damping: 16,
                    }}
                    className="relative inline-flex shrink-0 items-center"
                >
                    {compact && community.length > 0 ? (
                        <span className="inline-flex items-center" aria-hidden>
                            {community.map((type, index) => (
                                <span
                                    key={type}
                                    className="relative inline-flex rounded-full bg-card ring-1 ring-card"
                                    style={{
                                        marginLeft: index === 0 ? 0 : -6,
                                        zIndex: community.length - index,
                                    }}
                                >
                                    <ReactionIcon
                                        type={type}
                                        className="size-5"
                                    />
                                </span>
                            ))}
                        </span>
                    ) : reaction ? (
                        <ReactionIcon type={reaction} className="size-5" />
                    ) : (
                        <ReactionIcon
                            type="like"
                            className="size-5 opacity-70 grayscale"
                        />
                    )}
                    <AnimatePresence>
                        {bursts.map((burst) => (
                            <motion.span
                                key={burst.id}
                                className="pointer-events-none absolute top-1/2 left-1/2 size-1.5 rounded-full"
                                style={{ backgroundColor: burst.color }}
                                initial={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                }}
                                animate={{
                                    opacity: 0,
                                    x: burst.x,
                                    y: burst.y,
                                    scale: 0.2,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.48 }}
                            />
                        ))}
                    </AnimatePresence>
                </motion.span>
                {compact ? (
                    showCount && likesCount > 0 ? (
                        <span className="text-muted-foreground tabular-nums">
                            ({likesCount})
                        </span>
                    ) : null
                ) : (
                    <>
                        <span className="truncate">
                            {meta?.label ?? 'Like'}
                        </span>
                        {showCount && community.length > 0 ? (
                            <span
                                className="inline-flex items-center gap-1"
                                aria-label={`${likesCount} reactions`}
                            >
                                <span className="inline-flex items-center ps-0.5">
                                    {community.map((type, index) => (
                                        <span
                                            key={type}
                                            className="relative inline-flex rounded-full bg-card ring-1 ring-card"
                                            style={{
                                                marginLeft:
                                                    index === 0 ? 0 : -6,
                                                zIndex:
                                                    community.length - index,
                                            }}
                                        >
                                            <ReactionIcon
                                                type={type}
                                                className="size-4"
                                            />
                                        </span>
                                    ))}
                                </span>
                                {likesCount > 0 ? (
                                    <span className="font-bold tabular-nums">
                                        {likesCount}
                                    </span>
                                ) : null}
                            </span>
                        ) : showCount && likesCount > 0 ? (
                            <span className="font-bold tabular-nums">
                                {likesCount}
                            </span>
                        ) : null}
                    </>
                )}
            </motion.button>
        </div>
    );
}

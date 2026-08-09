import { Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
    postId: number;
    bookmarked: boolean;
    bookmarksCount?: number;
    showCount?: boolean;
    /** Icon + (count) only — no text label. */
    compact?: boolean;
    label?: string;
    className?: string;
    onChange?: (bookmarked: boolean, bookmarksCount: number) => void;
};

export function BookmarkButton({
    postId,
    bookmarked: initialBookmarked,
    bookmarksCount: initialBookmarksCount = 0,
    showCount = false,
    compact = false,
    label,
    className,
    onChange,
}: Props) {
    const reduce = usePrefersReducedMotion();
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [bookmarksCount, setBookmarksCount] = useState(initialBookmarksCount);
    const [processing, setProcessing] = useState(false);

    async function toggle(): Promise<void> {
        if (processing) {
            return;
        }

        setProcessing(true);

        const method = bookmarked ? 'DELETE' : 'POST';
        const xsrf = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        try {
            const response = await fetch(`/posts/${postId}/bookmark`, {
                method,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(xsrf
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) }
                        : {}),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as {
                bookmarked: boolean;
                bookmarks_count: number;
            };

            setBookmarked(data.bookmarked);
            setBookmarksCount(data.bookmarks_count);
            onChange?.(data.bookmarked, data.bookmarks_count);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <motion.button
            type="button"
            disabled={processing}
            onClick={() => void toggle()}
            data-test="bookmark-button"
            aria-label={
                bookmarked
                    ? `Remove bookmark, ${bookmarksCount} total`
                    : `Bookmark, ${bookmarksCount} total`
            }
            whileTap={reduce ? undefined : { scale: 0.92 }}
            className={cn(
                'inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent',
                !compact && 'gap-1.5 px-3 py-1.5',
                bookmarked && 'text-primary hover:text-primary',
                className,
            )}
        >
            <motion.span
                animate={
                    reduce
                        ? undefined
                        : {
                              scale: bookmarked ? 1.15 : 1,
                              rotate: bookmarked ? -8 : 0,
                          }
                }
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
            >
                <Bookmark
                    className={cn('size-4', bookmarked && 'fill-current')}
                />
            </motion.span>
            {compact ? (
                showCount && bookmarksCount > 0 ? (
                    <span className="tabular-nums">({bookmarksCount})</span>
                ) : (
                    <span className="sr-only">
                        {bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </span>
                )
            ) : (
                <>
                    {label ? (
                        <span>{bookmarked ? 'Saved' : label}</span>
                    ) : (
                        <span className="sr-only">
                            {bookmarked ? 'Remove bookmark' : 'Bookmark'}
                        </span>
                    )}
                    {showCount && bookmarksCount > 0 ? (
                        <span className="font-semibold tabular-nums">
                            {bookmarksCount}
                        </span>
                    ) : null}
                </>
            )}
        </motion.button>
    );
}

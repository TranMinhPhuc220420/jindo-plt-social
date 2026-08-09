import { AnimatePresence, motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
    name: string | null;
    /** Inline in the thread footer vs absolute overlay. */
    variant?: 'bubble' | 'status';
    className?: string;
};

function Dots({ reduce }: { reduce: boolean }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground/70"
                    animate={
                        reduce
                            ? undefined
                            : { opacity: [0.35, 1, 0.35], y: [0, -2.5, 0] }
                    }
                    transition={{
                        duration: 0.85,
                        repeat: Infinity,
                        delay: i * 0.14,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </span>
    );
}

/**
 * Typing affordance that does not shove the composer — bubble sits in the
 * thread, status line is a fixed-height slot under the header.
 */
export function TypingIndicator({
    name,
    variant = 'bubble',
    className,
}: Props) {
    const reduce = usePrefersReducedMotion();
    const active = Boolean(name);

    if (variant === 'status') {
        return (
            <p
                className={cn(
                    'h-4 truncate text-xs text-muted-foreground transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                    className,
                )}
                aria-live="polite"
            >
                {active ? 'typing…' : '\u00a0'}
            </p>
        );
    }

    return (
        <AnimatePresence>
            {active ? (
                <motion.div
                    key="typing-bubble"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                        'flex items-end gap-2',
                        className,
                    )}
                    role="status"
                    aria-live="polite"
                    aria-label={`${name} is typing`}
                >
                    <div className="flex h-9 items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-3">
                        <Dots reduce={reduce} />
                    </div>
                    <span className="sr-only">{name} is typing</span>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

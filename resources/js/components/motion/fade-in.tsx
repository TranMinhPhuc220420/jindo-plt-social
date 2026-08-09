import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    className?: string;
    delay?: number;
    y?: number;
};

export function FadeIn({
    children,
    className,
    delay = 0,
    y = 12,
}: Props) {
    const reduce = usePrefersReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

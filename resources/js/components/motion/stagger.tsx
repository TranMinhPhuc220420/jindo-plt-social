import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type StaggerProps = {
    children: ReactNode;
    className?: string;
    delayChildren?: number;
    staggerChildren?: number;
};

export function Stagger({
    children,
    className,
    delayChildren = 0.05,
    staggerChildren = 0.06,
}: StaggerProps) {
    const reduce = usePrefersReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {
                    transition: {
                        delayChildren,
                        staggerChildren,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

type StaggerItemProps = {
    children: ReactNode;
    className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
    const reduce = usePrefersReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={cn(className)}
            variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';

type Props = {
    children: ReactNode;
};

export function PageTransition({ children }: Props) {
    const { url } = usePage();
    const reduce = usePrefersReducedMotion();
    const key = url.split('?')[0];

    if (reduce) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="min-w-0"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

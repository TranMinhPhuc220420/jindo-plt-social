import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';

type Props = {
    children: ReactNode;
};

export function MotionProvider({ children }: Props) {
    const reduce = usePrefersReducedMotion();

    return (
        <MotionConfig
            reducedMotion={reduce ? 'always' : 'user'}
            transition={
                reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 32 }
            }
        >
            {children}
        </MotionConfig>
    );
}

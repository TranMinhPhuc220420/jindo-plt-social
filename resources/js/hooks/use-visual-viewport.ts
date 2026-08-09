import { useEffect, useState } from 'react';

/**
 * Offset from the bottom of the layout viewport to the visual viewport
 * (soft keyboard height on mobile). Zero when the keyboard is closed.
 */
export function useVisualViewportBottomInset(): number {
    const [inset, setInset] = useState(0);

    useEffect(() => {
        const vv = window.visualViewport;

        if (!vv) {
            return;
        }

        const update = () => {
            if (!window.matchMedia('(max-width: 767px)').matches) {
                setInset(0);

                return;
            }

            const next = Math.max(
                0,
                window.innerHeight - vv.height - vv.offsetTop,
            );
            setInset(next);
        };

        update();
        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);

        return () => {
            vv.removeEventListener('resize', update);
            vv.removeEventListener('scroll', update);
        };
    }, []);

    return inset;
}

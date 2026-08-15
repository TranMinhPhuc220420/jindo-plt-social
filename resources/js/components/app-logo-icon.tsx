import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'PLT Học Bá',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            alt={alt}
            decoding="async"
            className={cn('object-contain', className)}
            {...props}
        />
    );
}

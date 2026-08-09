import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({
    title,
    description,
    action,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center',
                className,
            )}
        >
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
                <p className="max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    );
}

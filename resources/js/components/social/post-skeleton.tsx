import { cn } from '@/lib/utils';

type Props = {
    count?: number;
    className?: string;
};

function Bone({ className }: { className?: string }) {
    return <div className={cn('motion-shimmer rounded', className)} />;
}

export function PostSkeleton({ count = 3, className }: Props) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-lg bg-card p-3 shadow-xs"
                >
                    <div className="flex gap-3">
                        <Bone className="size-10 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-2 pt-1">
                            <Bone className="h-3 w-1/3" />
                            <Bone className="h-3 w-1/4" />
                        </div>
                    </div>
                    <div className="space-y-2 pl-13">
                        <Bone className="h-3 w-full" />
                        <Bone className="h-3 w-5/6" />
                        <Bone className="h-40 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

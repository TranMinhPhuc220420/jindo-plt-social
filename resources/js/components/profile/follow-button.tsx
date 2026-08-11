import { Form } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Props = {
    username: string;
    isFollowing: boolean;
    /** `text` = Instagram-style text control (post headers). */
    variant?: 'default' | 'text';
    size?: 'default' | 'sm';
    className?: string;
};

export function FollowButton({
    username,
    isFollowing,
    variant = 'default',
    size = 'default',
    className,
}: Props) {
    const reduce = usePrefersReducedMotion();
    const [hovering, setHovering] = useState(false);

    return (
        <Form
            method={isFollowing ? 'delete' : 'post'}
            action={`/u/${username}/follow`}
            options={{ preserveScroll: true }}
            className="inline-flex"
        >
            {({ processing }) =>
                variant === 'text' ? (
                    <motion.button
                        type="submit"
                        disabled={processing}
                        data-test="follow-button"
                        whileTap={reduce ? undefined : { scale: 0.96 }}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        onFocus={() => setHovering(true)}
                        onBlur={() => setHovering(false)}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-colors',
                            'disabled:pointer-events-none disabled:opacity-60',
                            !isFollowing &&
                                'text-[#0095F6] hover:text-[#1877F2]',
                            isFollowing && !hovering && 'text-foreground',
                            isFollowing && hovering && 'text-red-500',
                            className,
                        )}
                    >
                        {processing ? <Spinner className="size-3.5" /> : null}
                        {!isFollowing
                            ? 'Follow'
                            : hovering
                              ? 'Unfollow'
                              : 'Following'}
                    </motion.button>
                ) : (
                    <motion.div
                        whileTap={reduce ? undefined : { scale: 0.96 }}
                        className="inline-flex"
                    >
                        <Button
                            type="submit"
                            size={size}
                            variant={isFollowing ? 'outline' : 'default'}
                            disabled={processing}
                            data-test="follow-button"
                            className={cn(
                                size === 'sm' && 'h-8 shrink-0 px-3 text-xs',
                                className,
                            )}
                        >
                            {processing && <Spinner />}
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    </motion.div>
                )
            }
        </Form>
    );
}

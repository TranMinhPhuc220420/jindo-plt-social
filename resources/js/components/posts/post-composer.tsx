import { usePage } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { useCreatePostOptional } from '@/components/posts/create-post-provider';
import { PostComposerShell } from '@/components/posts/post-composer-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

type Props = {
    className?: string;
};

/**
 * Collapsed feed trigger that opens the shared create-post dialog.
 */
export function PostComposer({ className }: Props) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const user = auth.user;
    const sharedCreate = useCreatePostOptional();
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState(0);

    function openComposer(): void {
        if (sharedCreate) {
            sharedCreate.openCreatePost();

            return;
        }

        setSession((value) => value + 1);
        setOpen(true);
    }

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg bg-card p-3 shadow-xs',
                className,
            )}
        >
            <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0">
                    <AvatarImage
                        src={user.avatar ?? undefined}
                        alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <button
                    type="button"
                    className="flex min-h-10 min-w-0 flex-1 items-center rounded-full bg-muted px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80"
                    onClick={openComposer}
                >
                    What&apos;s on your mind, {user.name.split(' ')[0]}?
                </button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 text-green-600"
                    aria-label="Add photos"
                    onClick={openComposer}
                >
                    <ImagePlus className="size-5" />
                </Button>
            </div>

            {!sharedCreate ? (
                <PostComposerShell
                    key={session}
                    open={open}
                    onOpenChange={setOpen}
                    mode="create"
                    action="/posts"
                />
            ) : null}
        </div>
    );
}

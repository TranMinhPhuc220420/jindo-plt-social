import { Form } from '@inertiajs/react';
import { PenSquare } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    /** Visible label on wider buttons; icon-only when omitted. */
    label?: string;
};

function NewMessageForm({
    inputId,
    onSuccess,
}: {
    inputId: string;
    onSuccess: () => void;
}) {
    return (
        <Form
            method="post"
            action="/messages"
            className="space-y-3"
            resetOnSuccess
            onSuccess={onSuccess}
        >
            {({ processing, errors }) => (
                <>
                    <div className="space-y-1.5">
                        <label
                            htmlFor={inputId}
                            className="text-xs font-medium"
                        >
                            Username
                        </label>
                        <Input
                            id={inputId}
                            name="username"
                            required
                            placeholder="@username"
                            autoComplete="off"
                            autoFocus
                            className="h-11"
                        />
                        <InputError message={errors.username} />
                    </div>
                    <Button
                        type="submit"
                        className="h-11 w-full"
                        disabled={processing}
                    >
                        Start chat
                    </Button>
                </>
            )}
        </Form>
    );
}

/**
 * Compose affordance — icon (Messenger-style) opens a sheet on mobile
 * or a centered dialog on desktop.
 */
export function NewMessageButton({ className, label }: Props) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    const trigger = (
        <Button
            type="button"
            variant={label ? 'secondary' : 'ghost'}
            size={label ? 'sm' : 'icon'}
            className={cn(
                label
                    ? 'shrink-0'
                    : 'size-10 shrink-0 rounded-full text-primary hover:bg-primary/10 hover:text-primary',
                className,
            )}
            aria-label="New message"
            onClick={() => setOpen(true)}
        >
            {label ? label : <PenSquare className="size-5" aria-hidden />}
        </Button>
    );

    if (isMobile) {
        return (
            <>
                {trigger}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent
                        side="bottom"
                        className="gap-0 rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
                    >
                        <SheetHeader className="pb-2 text-left">
                            <SheetTitle>New message</SheetTitle>
                            <SheetDescription>
                                You can message people who follow you back.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 pb-2">
                            <NewMessageForm
                                inputId="new-message-username-mobile"
                                onSuccess={() => setOpen(false)}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return (
        <>
            {trigger}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New message</DialogTitle>
                        <DialogDescription>
                            You can message people who follow you back.
                        </DialogDescription>
                    </DialogHeader>
                    <NewMessageForm
                        inputId="new-message-username-desktop"
                        onSuccess={() => setOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    processing?: boolean;
    children?: ReactNode;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    onConfirm,
    processing = false,
    children,
}: Props) {
    const reduce = usePrefersReducedMotion();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
                <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="grid gap-4 p-6"
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description ? (
                            <DialogDescription>{description}</DialogDescription>
                        ) : null}
                    </DialogHeader>
                    {children}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            variant={destructive ? 'destructive' : 'default'}
                            onClick={onConfirm}
                            disabled={processing}
                        >
                            {confirmLabel}
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

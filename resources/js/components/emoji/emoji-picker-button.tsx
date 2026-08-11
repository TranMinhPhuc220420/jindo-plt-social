import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type Props = {
    onSelect: (emoji: string) => void;
    className?: string;
    /** Accessible name for the trigger. */
    label?: string;
};

function subscribeNoop() {
    return () => {};
}

function useHasHydrated(): boolean {
    return useSyncExternalStore(
        subscribeNoop,
        () => true,
        () => false,
    );
}

/**
 * Smile button opening a native-style emoji picker.
 * Mobile: bottom sheet; desktop: dropdown above the trigger.
 * Defers portal UI until hydrate to avoid SSR mismatch.
 */
export function EmojiPickerButton({
    onSelect,
    className,
    label = 'Insert emoji',
}: Props) {
    const { resolvedAppearance } = useAppearance();
    const isMobile = useIsMobile();
    const hydrated = useHasHydrated();
    const [open, setOpen] = useState(false);

    const theme = resolvedAppearance === 'dark' ? Theme.DARK : Theme.LIGHT;

    const picker = (
        <EmojiPicker
            theme={theme}
            emojiStyle={EmojiStyle.NATIVE}
            lazyLoadEmojis
            width={isMobile ? undefined : 320}
            height={isMobile ? undefined : 360}
            style={isMobile ? { width: '100%', height: '100%' } : undefined}
            previewConfig={{ showPreview: false }}
            onEmojiClick={(data: EmojiClickData) => {
                onSelect(data.emoji);
                setOpen(false);
            }}
        />
    );

    const triggerClassName = cn(
        'size-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground',
        className,
    );

    if (!hydrated) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={triggerClassName}
                aria-label={label}
                disabled
            >
                <Smile className="size-5" />
            </Button>
        );
    }

    if (isMobile) {
        return (
            <>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={triggerClassName}
                    aria-label={label}
                    aria-expanded={open}
                    onClick={() => setOpen(true)}
                >
                    <Smile className="size-5" />
                </Button>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent
                        side="bottom"
                        className="h-[min(50dvh,420px)] gap-0 rounded-t-2xl p-0 pb-[env(safe-area-inset-bottom)]"
                    >
                        <SheetHeader className="sr-only">
                            <SheetTitle>{label}</SheetTitle>
                        </SheetHeader>
                        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden pt-2">
                            {picker}
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={triggerClassName}
                    aria-label={label}
                >
                    <Smile className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                side="top"
                className="w-auto border-0 bg-transparent p-0 shadow-none"
                onCloseAutoFocus={(event) => event.preventDefault()}
            >
                {picker}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

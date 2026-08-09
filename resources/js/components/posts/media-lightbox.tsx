import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { PostMediaItem } from '@/types';

type Props = {
    media: PostMediaItem[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
};

export function MediaLightbox({
    media,
    index,
    onIndexChange,
    onClose,
}: Props) {
    const current = media[Math.min(Math.max(index, 0), media.length - 1)];
    const canPrev = index > 0;
    const canNext = index < media.length - 1;

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowLeft' && canPrev) {
                onIndexChange(index - 1);
            } else if (event.key === 'ArrowRight' && canNext) {
                onIndexChange(index + 1);
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [canNext, canPrev, index, onClose, onIndexChange]);

    if (!current) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal
            onClick={onClose}
        >
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/10 hover:text-white"
                onClick={onClose}
            >
                <X className="size-5" />
                <span className="sr-only">Close</span>
            </Button>

            {media.length > 1 ? (
                <>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1/2 left-3 size-10 -translate-y-1/2 rounded-full text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
                        disabled={!canPrev}
                        onClick={(event) => {
                            event.stopPropagation();
                            onIndexChange(index - 1);
                        }}
                    >
                        <ChevronLeft className="size-6" />
                        <span className="sr-only">Previous image</span>
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1/2 right-3 size-10 -translate-y-1/2 rounded-full text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
                        disabled={!canNext}
                        onClick={(event) => {
                            event.stopPropagation();
                            onIndexChange(index + 1);
                        }}
                    >
                        <ChevronRight className="size-6" />
                        <span className="sr-only">Next image</span>
                    </Button>
                </>
            ) : null}

            <img
                src={current.url}
                alt=""
                className="max-h-[90vh] max-w-full object-contain"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

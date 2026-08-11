import { useState } from 'react';
import { MediaCarousel } from '@/components/posts/media-carousel';
import { MediaLightbox } from '@/components/posts/media-lightbox';
import { cn } from '@/lib/utils';
import type { PostMediaItem } from '@/types';

type Props = {
    media: PostMediaItem[];
};

function MediaStatusBanner({ status }: { status: string }) {
    if (status === 'pending') {
        return (
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white">
                Processing…
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="absolute inset-x-0 bottom-0 bg-red-700/80 px-2 py-1 text-xs text-white">
                Processing failed
            </div>
        );
    }

    return null;
}

function SingleMedia({
    item,
    onOpen,
}: {
    item: PostMediaItem;
    onOpen: () => void;
}) {
    const hasRatio =
        item.width != null && item.height != null && item.height > 0;

    return (
        <button
            type="button"
            className="relative block w-full overflow-hidden bg-muted"
            onClick={onOpen}
        >
            <img
                src={item.url}
                alt=""
                className="mx-auto max-h-[min(680px,70vh)] w-full object-contain"
                style={
                    hasRatio
                        ? { aspectRatio: `${item.width} / ${item.height}` }
                        : undefined
                }
            />
            <MediaStatusBanner status={item.status} />
        </button>
    );
}

function TwoUpMedia({
    media,
    onOpen,
}: {
    media: PostMediaItem[];
    onOpen: (index: number) => void;
}) {
    return (
        <div className="grid aspect-[2/1] max-h-[360px] grid-cols-2 gap-0.5 bg-muted">
            {media.slice(0, 2).map((item, index) => (
                <button
                    key={item.id}
                    type="button"
                    className="relative min-h-0 overflow-hidden"
                    onClick={() => onOpen(index)}
                >
                    <img
                        src={item.url}
                        alt=""
                        className="size-full object-cover"
                    />
                    <MediaStatusBanner status={item.status} />
                </button>
            ))}
        </div>
    );
}

export function PostMedia({ media }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (media.length === 0) {
        return null;
    }

    if (media.length >= 3) {
        return <MediaCarousel media={media} />;
    }

    return (
        <>
            {media.length === 1 ? (
                <SingleMedia
                    item={media[0]}
                    onOpen={() => setLightboxIndex(0)}
                />
            ) : (
                <TwoUpMedia
                    media={media}
                    onOpen={(index) => setLightboxIndex(index)}
                />
            )}

            {lightboxIndex !== null ? (
                <MediaLightbox
                    media={media}
                    index={lightboxIndex}
                    onIndexChange={setLightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            ) : null}
        </>
    );
}

/** Full-bleed single image for legacy `image_url` posts. */
export function LegacyPostImage({
    src,
    className,
}: {
    src: string;
    className?: string;
}) {
    return (
        <div className={cn('overflow-hidden bg-muted', className)}>
            <img
                src={src}
                alt=""
                className="mx-auto max-h-[min(680px,70vh)] w-full object-contain"
            />
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import { MediaLightbox } from '@/components/posts/media-lightbox';
import { cn } from '@/lib/utils';
import type { PostMediaItem } from '@/types';

type Props = {
    media: PostMediaItem[];
};

type FrameSize = {
    width: number;
    height: number;
};

const SWIPE_THRESHOLD_PX = 48;
const MAX_FRAME_HEIGHT_PX = 680;
const MAX_FRAME_HEIGHT_VH = 0.7;

function isTaller(a: FrameSize, b: FrameSize): boolean {
    return a.height / a.width > b.height / b.width;
}

function frameFromMeta(media: PostMediaItem[]): FrameSize | null {
    let tallest: FrameSize | null = null;

    for (const item of media) {
        if (item.width == null || item.height == null || item.width <= 0) {
            continue;
        }

        const candidate = { width: item.width, height: item.height };

        if (tallest === null || isTaller(candidate, tallest)) {
            tallest = candidate;
        }
    }

    return tallest;
}

function measureNaturalSize(url: string): Promise<FrameSize> {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            resolve({
                width: Math.max(1, image.naturalWidth),
                height: Math.max(1, image.naturalHeight),
            });
        };

        image.onerror = () => {
            resolve({ width: 1, height: 1 });
        };

        image.src = url;
    });
}

function useTallestFrame(media: PostMediaItem[]): FrameSize {
    const metaFrame = useMemo(() => frameFromMeta(media), [media]);
    const [measuredFrame, setMeasuredFrame] = useState<FrameSize | null>(null);

    useEffect(() => {
        if (metaFrame !== null) {
            return;
        }

        let cancelled = false;

        void Promise.all(
            media.map((item) => measureNaturalSize(item.url)),
        ).then((sizes) => {
            if (cancelled) {
                return;
            }

            let tallest: FrameSize = { width: 1, height: 1 };

            for (const size of sizes) {
                if (isTaller(size, tallest)) {
                    tallest = size;
                }
            }

            setMeasuredFrame(tallest);
        });

        return () => {
            cancelled = true;
        };
    }, [media, metaFrame]);

    return metaFrame ?? measuredFrame ?? { width: 1, height: 1 };
}

function useSyncedFrameHeight(
    containerRef: RefObject<HTMLDivElement | null>,
    frame: FrameSize,
): number | undefined {
    const [height, setHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        const node = containerRef.current;

        if (!node) {
            return;
        }

        const update = (): void => {
            const width = node.clientWidth;

            if (width <= 0) {
                return;
            }

            const naturalHeight = width * (frame.height / frame.width);
            const maxHeight = Math.min(
                MAX_FRAME_HEIGHT_PX,
                window.innerHeight * MAX_FRAME_HEIGHT_VH,
            );

            setHeight(
                Math.max(1, Math.round(Math.min(naturalHeight, maxHeight))),
            );
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(node);
        window.addEventListener('resize', update);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [containerRef, frame.height, frame.width]);

    return height;
}

export function MediaCarousel({ media }: Props) {
    const [index, setIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const pointerStartX = useRef<number | null>(null);
    const didSwipe = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const frame = useTallestFrame(media);
    const frameHeight = useSyncedFrameHeight(containerRef, frame);

    if (media.length === 0) {
        return null;
    }

    const current = media[Math.min(index, media.length - 1)];
    const multi = media.length > 1;

    function goTo(next: number): void {
        setIndex(Math.min(Math.max(next, 0), media.length - 1));
    }

    function onPointerDown(event: PointerEvent<HTMLDivElement>): void {
        if (!multi || event.button !== 0) {
            return;
        }

        pointerStartX.current = event.clientX;
        didSwipe.current = false;
    }

    function onPointerMove(event: PointerEvent<HTMLDivElement>): void {
        if (pointerStartX.current === null) {
            return;
        }

        if (Math.abs(event.clientX - pointerStartX.current) > 12) {
            didSwipe.current = true;
        }
    }

    function onPointerUp(event: PointerEvent<HTMLDivElement>): void {
        if (pointerStartX.current === null) {
            return;
        }

        const delta = event.clientX - pointerStartX.current;
        pointerStartX.current = null;

        if (!didSwipe.current || Math.abs(delta) < SWIPE_THRESHOLD_PX) {
            return;
        }

        if (delta < 0) {
            goTo(index + 1);
        } else {
            goTo(index - 1);
        }
    }

    function onPointerCancel(): void {
        pointerStartX.current = null;
        didSwipe.current = false;
    }

    function openLightbox(): void {
        if (didSwipe.current) {
            didSwipe.current = false;

            return;
        }

        setLightbox(true);
    }

    return (
        <>
            <div
                ref={containerRef}
                className="relative w-full touch-pan-y overflow-hidden bg-muted"
                style={{
                    height: frameHeight,
                    aspectRatio:
                        frameHeight === undefined
                            ? `${frame.width} / ${frame.height}`
                            : undefined,
                    maxHeight: `min(${MAX_FRAME_HEIGHT_PX}px, ${MAX_FRAME_HEIGHT_VH * 100}vh)`,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            >
                <button
                    type="button"
                    className="absolute inset-0 block size-full cursor-zoom-in"
                    onClick={openLightbox}
                >
                    <img
                        src={current.url}
                        alt=""
                        draggable={false}
                        className="size-full object-contain select-none"
                    />
                </button>

                {multi ? (
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent"
                    />
                ) : null}

                {multi ? (
                    <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium tracking-wide text-white tabular-nums shadow-sm backdrop-blur-md">
                        {index + 1}
                        <span className="mx-0.5 text-white/55">/</span>
                        {media.length}
                    </div>
                ) : null}

                {current.status === 'pending' && (
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-black/60 px-2 py-1 text-xs text-white">
                        Processing…
                    </div>
                )}
                {current.status === 'failed' && (
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-red-700/80 px-2 py-1 text-xs text-white">
                        Processing failed
                    </div>
                )}

                {multi ? (
                    <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
                        <div
                            className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1.5 shadow-sm backdrop-blur-md"
                            role="tablist"
                            aria-label="Media slides"
                        >
                            {media.map((item, i) => {
                                const active = i === index;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        aria-label={`Go to image ${i + 1}`}
                                        className="flex h-8 min-w-8 items-center justify-center"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            goTo(i);
                                        }}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <span
                                            className={cn(
                                                'rounded-full bg-white/55 transition-all duration-300 ease-out',
                                                active
                                                    ? 'h-1.5 w-5 bg-white shadow-[0_0_0_1px_rgb(255_255_255_/_0.25)]'
                                                    : 'size-2 hover:bg-white/80',
                                            )}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </div>

            {lightbox ? (
                <MediaLightbox
                    media={media}
                    index={index}
                    onIndexChange={setIndex}
                    onClose={() => setLightbox(false)}
                />
            ) : null}
        </>
    );
}

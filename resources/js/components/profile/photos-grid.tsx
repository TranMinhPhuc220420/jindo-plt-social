import { Link } from '@inertiajs/react';
import type { ProfilePhoto } from '@/types';

type Props = {
    photos: ProfilePhoto[];
    username: string;
    title?: string;
    showSeeAll?: boolean;
};

export function PhotosGrid({
    photos,
    username,
    title = 'Photos',
    showSeeAll = true,
}: Props) {
    if (photos.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg bg-card p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{title}</h2>
                {showSeeAll ? (
                    <Link
                        href={`/u/${username}/photos`}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        See all
                    </Link>
                ) : null}
            </div>
            <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-md">
                {photos.map((photo) => (
                    <Link
                        key={photo.id}
                        href={`/posts/${photo.post_id}`}
                        className="relative aspect-square overflow-hidden bg-muted"
                    >
                        <img
                            src={photo.url}
                            alt=""
                            className="size-full object-cover transition-transform hover:scale-105"
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
}

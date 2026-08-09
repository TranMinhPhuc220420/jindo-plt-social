import { Head, Link } from '@inertiajs/react';
import { PhotosGrid } from '@/components/profile/photos-grid';
import { ProfileHeader } from '@/components/profile/profile-header';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type { ProfilePhoto, ProfileSummary } from '@/types';

type Props = {
    profile: ProfileSummary;
    photos: {
        data: ProfilePhoto[];
        next_page_url?: string | null;
        prev_page_url?: string | null;
    };
};

export default function ProfilePhotos({ profile, photos }: Props) {
    return (
        <>
            <Head title={`Photos · @${profile.username}`} />
            <div className="flex flex-col gap-3">
                <ProfileHeader profile={profile} activeTab="photos" />

                {photos.data.length === 0 ? (
                    <section className="rounded-lg bg-card shadow-xs">
                        <EmptyState
                            title="No photos yet"
                            description={`@${profile.username} hasn't shared any photos.`}
                        />
                    </section>
                ) : (
                    <PhotosGrid
                        photos={photos.data}
                        username={profile.username}
                        title="Photos"
                        showSeeAll={false}
                    />
                )}

                {photos.next_page_url ? (
                    <Button asChild variant="outline" className="w-full">
                        <Link href={photos.next_page_url} preserveScroll>
                            Load more
                        </Link>
                    </Button>
                ) : null}
            </div>
        </>
    );
}

ProfilePhotos.layout = {
    breadcrumbs: [],
};

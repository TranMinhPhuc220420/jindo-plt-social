import { Head, Link } from '@inertiajs/react';
import { PostCard } from '@/components/posts/post-card';
import { IntroCard } from '@/components/profile/intro-card';
import { PhotosGrid } from '@/components/profile/photos-grid';
import { ProfileHeader } from '@/components/profile/profile-header';
import { EmptyState } from '@/components/social/empty-state';
import { Button } from '@/components/ui/button';
import type {
    CursorPaginated,
    Post,
    ProfileAboutField,
    ProfilePhoto,
    ProfileSummary,
} from '@/types';

type Props = {
    profile: ProfileSummary;
    about: ProfileAboutField[];
    photos_preview: ProfilePhoto[];
    posts: CursorPaginated<Post>;
};

export default function ProfileShow({
    profile,
    about,
    photos_preview,
    posts,
}: Props) {
    return (
        <>
            <Head title={`@${profile.username}`} />
            <div className="flex flex-col gap-3">
                <ProfileHeader profile={profile} activeTab="posts" />

                <div className="grid gap-3 md:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="flex flex-col gap-3 md:sticky md:top-0 md:self-start">
                        <IntroCard
                            fields={about}
                            username={profile.username}
                            isOwn={profile.is_own}
                            joinedAt={profile.joined_at}
                        />
                        <PhotosGrid
                            photos={photos_preview}
                            username={profile.username}
                        />
                    </aside>

                    <div className="flex min-w-0 flex-col gap-3">
                        {posts.data.length === 0 ? (
                            <section className="rounded-lg bg-card shadow-xs">
                                <EmptyState
                                    title="No posts yet"
                                    description={`@${profile.username} hasn't posted anything.`}
                                />
                            </section>
                        ) : (
                            posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )}

                        {posts.next_page_url ? (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href={posts.next_page_url} preserveScroll>
                                    Load more
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

ProfileShow.layout = {
    breadcrumbs: [],
};

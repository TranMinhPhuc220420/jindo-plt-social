import { Head } from '@inertiajs/react';
import { AboutSection } from '@/components/profile/about-section';
import { ProfileHeader } from '@/components/profile/profile-header';
import type { ProfileAboutField, ProfileSummary } from '@/types';

type Props = {
    profile: ProfileSummary;
    about: ProfileAboutField[];
};

export default function ProfileAbout({ profile, about }: Props) {
    return (
        <>
            <Head title={`About · @${profile.username}`} />
            <div className="flex flex-col gap-3">
                <ProfileHeader profile={profile} activeTab="about" />
                <AboutSection
                    fields={about}
                    isOwn={profile.is_own}
                    joinedAt={profile.joined_at}
                />
            </div>
        </>
    );
}

ProfileAbout.layout = {
    breadcrumbs: [],
};

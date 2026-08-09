import { Form, Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { FollowButton } from '@/components/profile/follow-button';
import { ProfileMediaButton } from '@/components/profile/profile-media-button';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { useMainScrollContainer } from '@/components/social/main-scroll-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import type { ProfileSummary } from '@/types';

type Props = {
    profile: ProfileSummary;
    activeTab?: 'posts' | 'about' | 'photos';
};

export function ProfileHeader({ profile, activeTab = 'posts' }: Props) {
    const getInitials = useInitials();
    const reduce = usePrefersReducedMotion();
    const ref = useRef<HTMLElement>(null);
    const scrollContainer = useMainScrollContainer();
    const { scrollYProgress } = useScroll({
        target: ref,
        container: scrollContainer ?? undefined,
        offset: ['start start', 'end start'],
    });
    const coverY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

    return (
        <header
            ref={ref}
            className="overflow-hidden rounded-lg bg-card shadow-xs"
        >
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/30 to-muted md:h-52">
                <motion.div
                    style={reduce ? undefined : { y: coverY }}
                    className="absolute inset-0"
                >
                    {profile.cover ? (
                        <img
                            src={profile.cover}
                            alt=""
                            className="size-full scale-110 object-cover"
                        />
                    ) : (
                        <div className="size-full bg-gradient-to-br from-primary/40 to-muted" />
                    )}
                </motion.div>
                {profile.is_own ? (
                    <div className="absolute right-3 bottom-3 z-10">
                        <ProfileMediaButton
                            kind="cover"
                            className="h-9 px-3"
                        />
                    </div>
                ) : null}
            </div>
            <div className="space-y-3 px-4 pb-0">
                <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
                    <motion.div
                        initial={reduce ? false : { scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 22,
                        }}
                        className="relative"
                    >
                        <Avatar className="size-24 border-4 border-card md:size-28">
                            <AvatarImage
                                src={profile.avatar ?? undefined}
                                alt={profile.name}
                            />
                            <AvatarFallback className="text-xl">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        {profile.is_own ? (
                            <ProfileMediaButton
                                kind="avatar"
                                className="absolute right-1 bottom-1 size-9"
                            />
                        ) : null}
                    </motion.div>
                    <div className="flex flex-wrap gap-2 pb-1">
                        {!profile.is_own && profile.can_follow ? (
                            <FollowButton
                                username={profile.username}
                                isFollowing={profile.is_following}
                            />
                        ) : null}
                        {!profile.is_own && profile.can_message ? (
                            <Form method="post" action="/messages">
                                <input
                                    type="hidden"
                                    name="username"
                                    value={profile.username}
                                />
                                <Button type="submit" variant="outline">
                                    Message
                                </Button>
                            </Form>
                        ) : null}
                        {profile.is_own ? (
                            <Button variant="outline" asChild>
                                <Link href="/settings/profile">
                                    Edit profile
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold leading-tight">
                        {profile.name}
                    </h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    {profile.bio ? (
                        <p className="mt-2 text-sm leading-relaxed">
                            {profile.bio}
                        </p>
                    ) : null}
                </div>
                <div className="flex gap-4 text-sm">
                    <Link
                        href={`/u/${profile.username}/following`}
                        className="hover:underline"
                    >
                        <span className="font-semibold">
                            {profile.following_count}
                        </span>{' '}
                        <span className="text-muted-foreground">Following</span>
                    </Link>
                    <Link
                        href={`/u/${profile.username}/followers`}
                        className="hover:underline"
                    >
                        <span className="font-semibold">
                            {profile.followers_count}
                        </span>{' '}
                        <span className="text-muted-foreground">Followers</span>
                    </Link>
                </div>
                <ProfileTabs username={profile.username} active={activeTab} />
            </div>
        </header>
    );
}

export type ProfileFieldVisibility = 'public' | 'mutual' | 'only_me';

export type ProfileAboutField = {
    key: string;
    label: string;
    value: string;
};

export type ProfileAboutSettingsField = {
    key: string;
    label: string;
    value: string | null;
    visibility: ProfileFieldVisibility;
};

export type ProfilePhoto = {
    id: number;
    url: string;
    post_id: number;
};

export type ProfileSummary = {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    cover: string | null;
    joined_at: string | null;
    followers_count: number;
    following_count: number;
    is_own: boolean;
    is_following: boolean;
    can_follow: boolean;
    can_message?: boolean;
};

export type ProfileListUser = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
    is_following?: boolean;
    can_follow?: boolean;
};

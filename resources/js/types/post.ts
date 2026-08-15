import type { ReactionCounts, ReactionType } from '@/lib/reactions';
import type { PostMediaItem } from './media';

export type PostAuthor = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    followed_by_viewer: boolean;
    can_follow: boolean;
};

export type SharedPostAuthor = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
};

export type SharedPost = {
    id: number;
    body: string;
    media: PostMediaItem[];
    image_url: string | null;
    unavailable: boolean;
    created_at: string | null;
    user: SharedPostAuthor | null;
};

export type Post = {
    id: number;
    body: string;
    image_url: string | null;
    media: PostMediaItem[];
    created_at: string | null;
    likes_count: number;
    comments_count: number;
    bookmarks_count: number;
    shares_count: number;
    reaction_counts: ReactionCounts;
    viewer_reaction: ReactionType | null;
    liked_by_viewer: boolean;
    bookmarked_by_viewer: boolean;
    shared_post: SharedPost | null;
    moderation_status: 'pending' | 'approved' | 'rejected';
    moderation_reason: string | null;
    user: PostAuthor;
    can: {
        update: boolean;
        delete: boolean;
        report: boolean;
    };
};

export type CursorPaginated<T> = {
    data: T[];
    path: string;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
    next_page_url: string | null;
    prev_page_url: string | null;
};

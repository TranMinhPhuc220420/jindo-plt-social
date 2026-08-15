import type { SharedPost } from './post';

export type MessageUser = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
};

export type ChatMessage = {
    id: string;
    client_id?: string | null;
    conversation_id?: string;
    body: string | null;
    image_url: string | null;
    shared_post?: SharedPost | null;
    read_at: string | null;
    created_at: string | null;
    at?: number;
    user: MessageUser;
    is_mine: boolean;
};

export type ConversationSummary = {
    id: string;
    other_user: MessageUser | null;
    last_message: {
        body: string | null;
        created_at: string | null;
    } | null;
    unread_count?: number;
    updated_at?: number;
};

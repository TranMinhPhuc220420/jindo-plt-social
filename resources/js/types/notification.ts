export type AppNotification = {
    id: string;
    type: string;
    data: {
        type?: string;
        message?: string;
        body?: string;
        url?: string;
        actor_name?: string;
        actor_username?: string;
        actor_avatar?: string;
        post_image?: string;
        reaction?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string | null;
};

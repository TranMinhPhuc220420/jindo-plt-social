export type CommentAuthor = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
};

export type Comment = {
    id: number;
    body: string;
    created_at: string | null;
    parent_id: number | null;
    user: CommentAuthor;
    can_delete: boolean;
    can_report: boolean;
    replies: Comment[];
};

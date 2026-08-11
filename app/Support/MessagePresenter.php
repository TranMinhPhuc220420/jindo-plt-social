<?php

namespace App\Support;

use App\Models\Message;
use App\Models\User;

class MessagePresenter
{
    /**
     * @return array{
     *     id: int,
     *     conversation_id: int,
     *     body: string|null,
     *     image_url: string|null,
     *     shared_post: array<string, mixed>|null,
     *     read_at: string|null,
     *     created_at: string|null,
     *     user: array{id: int, name: string, username: string, avatar: string|null},
     *     is_mine: bool
     * }
     */
    public static function toChatArray(Message $message, User $viewer): array
    {
        $message->loadMissing(['user']);

        if ($message->shared_post_id !== null) {
            $message->loadMissing(['sharedPost.user', 'sharedPost.media']);
        }

        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'body' => $message->body,
            'image_url' => $message->imageUrl(),
            'shared_post' => $message->shared_post_id
                ? PostPresenter::embedSharedPost(
                    $message->sharedPost,
                    (int) $message->shared_post_id,
                )
                : null,
            'read_at' => $message->read_at?->toIso8601String(),
            'created_at' => $message->created_at?->toIso8601String(),
            'user' => [
                'id' => $message->user->id,
                'name' => $message->user->name,
                'username' => $message->user->username,
                'avatar' => $message->user->avatarUrl(),
            ],
            'is_mine' => $message->user_id === $viewer->id,
        ];
    }
}

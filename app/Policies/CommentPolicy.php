<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    public function create(User $user): bool
    {
        return ! $user->isSuspended();
    }

    public function delete(User $user, Comment $comment): bool
    {
        if ($user->id === $comment->user_id) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        $comment->loadMissing('post');

        return $user->id === $comment->post->user_id;
    }
}

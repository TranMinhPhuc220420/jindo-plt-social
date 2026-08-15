<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    public function view(?User $user, Post $post): bool
    {
        if ($user === null) {
            return false;
        }

        return $post->isApproved()
            || $user->id === $post->user_id
            || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return ! $user->isSuspended();
    }

    public function engage(User $user, Post $post): bool
    {
        return ! $user->isSuspended() && $post->isApproved();
    }

    public function update(User $user, Post $post): bool
    {
        return ! $user->isSuspended() && $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->isAdmin();
    }
}

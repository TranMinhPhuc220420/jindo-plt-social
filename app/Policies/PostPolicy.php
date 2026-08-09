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
        return $user !== null;
    }

    public function create(User $user): bool
    {
        return ! $user->isSuspended();
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

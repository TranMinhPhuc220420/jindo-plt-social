<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    public function suspend(User $user, User $model): bool
    {
        return $user->isAdmin() && $user->id !== $model->id;
    }

    public function follow(User $user, User $model): bool
    {
        return ! $user->isSuspended()
            && $user->id !== $model->id
            && ! $model->isSuspended();
    }
}

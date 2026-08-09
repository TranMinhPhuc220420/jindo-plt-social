<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return ! $user->isSuspended();
    }
}

<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function create(User $user, Conversation $conversation): bool
    {
        return ! $user->isSuspended()
            && $conversation->participants()->where('users.id', $user->id)->exists();
    }

    public function view(User $user, Message $message): bool
    {
        return $message->conversation
            ->participants()
            ->where('users.id', $user->id)
            ->exists();
    }
}

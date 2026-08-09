<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;

class UnreadMessageService
{
    public function countFor(User $user): int
    {
        return Message::query()
            ->whereNull('read_at')
            ->where('user_id', '!=', $user->id)
            ->whereHas(
                'conversation.participants',
                fn ($query) => $query->where('users.id', $user->id),
            )
            ->count();
    }
}

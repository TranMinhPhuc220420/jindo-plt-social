<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ConversationService
{
    public function findOrCreateBetween(User $a, User $b): Conversation
    {
        if (! $a->isMutualWith($b)) {
            throw new InvalidArgumentException('Users must follow each other to message.');
        }

        $existing = Conversation::query()
            ->whereHas('participants', fn (Builder $query) => $query->where('users.id', $a->id))
            ->whereHas('participants', fn (Builder $query) => $query->where('users.id', $b->id))
            ->whereDoesntHave('participants', fn (Builder $query) => $query->whereNotIn('users.id', [$a->id, $b->id]))
            ->first();

        if ($existing !== null) {
            return $existing->load('participants');
        }

        return DB::transaction(function () use ($a, $b): Conversation {
            $conversation = Conversation::query()->create();
            $conversation->participants()->attach([$a->id, $b->id]);

            return $conversation->load('participants');
        });
    }
}

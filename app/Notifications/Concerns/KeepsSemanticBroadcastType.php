<?php

namespace App\Notifications\Concerns;

use App\Models\User;

/**
 * Keep toArray() `type` (post_liked, …) on the broadcast payload.
 * Laravel's default merge overwrites it with the PHP class name.
 *
 * @method array<string, mixed> toArray(object $notifiable)
 */
trait KeepsSemanticBroadcastType
{
    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return array_merge($this->toArray(new User), [
            'id' => $this->id,
        ]);
    }
}

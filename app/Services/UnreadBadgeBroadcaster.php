<?php

namespace App\Services;

use App\Events\UnreadBadgesUpdated;
use App\Models\User;
use Throwable;

/**
 * Publishes a complete unread badge snapshot (messages + notifications).
 * Message unread is client-owned (RTDB inbox); the server always sends 0.
 * Fail-soft: HTTP callers should not depend on RTDB/Reverb succeeding.
 */
class UnreadBadgeBroadcaster
{
    public function publish(User $user): void
    {
        $user->unsetRelation('unreadNotifications');
        $user->unsetRelation('notifications');

        try {
            broadcast(new UnreadBadgesUpdated(
                $user,
                0,
                $user->unreadNotifications()->count(),
            ));
        } catch (Throwable $e) {
            report($e);
        }
    }
}

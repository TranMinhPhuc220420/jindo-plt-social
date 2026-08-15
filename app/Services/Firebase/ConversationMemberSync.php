<?php

namespace App\Services\Firebase;

class ConversationMemberSync
{
    public function __construct(private FirebaseRealtimePublisher $publisher) {}

    /**
     * Upsert RTDB member map so Security Rules can authorize conversation reads.
     * Keys must be string UIDs to match Firebase Auth custom-token uid.
     */
    public function syncPair(string $conversationId, int ...$userIds): void
    {
        if (! $this->publisher->enabled()) {
            return;
        }

        foreach ($userIds as $userId) {
            $this->publisher->set(
                'realtime/conversations/'.$conversationId.'/members/'.(string) $userId,
                true,
            );
        }
    }
}

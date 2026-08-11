<?php

namespace App\Services\Firebase;

use App\Models\Conversation;

class ConversationMemberSync
{
    public function __construct(private FirebaseRealtimePublisher $publisher) {}

    /**
     * Upsert RTDB member map so Security Rules can authorize conversation reads.
     */
    public function sync(Conversation $conversation): void
    {
        if (! $this->publisher->enabled()) {
            return;
        }

        $conversation->loadMissing('participants');

        foreach ($conversation->participants as $participant) {
            $this->publisher->set(
                'realtime/conversations/'.$conversation->id.'/members/'.$participant->id,
                true,
            );
        }
    }
}

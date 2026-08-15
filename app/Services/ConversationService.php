<?php

namespace App\Services;

use App\Models\User;
use App\Services\Firebase\ConversationMemberSync;
use App\Support\ConversationId;
use InvalidArgumentException;

class ConversationService
{
    public function __construct(private ConversationMemberSync $memberSync) {}

    /**
     * Gate a 1:1 thread: mutual follow + Admin member map. Returns the RTDB cid.
     */
    public function ensureBetween(User $viewer, User $other): string
    {
        if ($viewer->id === $other->id || ! $viewer->isMutualWith($other)) {
            throw new InvalidArgumentException('Users must follow each other to message.');
        }

        $conversationId = ConversationId::between((int) $viewer->id, (int) $other->id);
        $this->memberSync->syncPair($conversationId, (int) $viewer->id, (int) $other->id);

        return $conversationId;
    }
}

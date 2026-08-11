<?php

namespace App\Services\Messaging;

use App\Events\MessageSent;
use App\Events\UnreadBadgesUpdated;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\UnreadMessageService;
use Throwable;

class MessageBroadcaster
{
    /**
     * Critical path for the receiver — keep synchronous and fail-soft.
     */
    public function publishSent(Message $message): void
    {
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * Badge updates are not on the chat critical path — run after the HTTP response.
     */
    public function scheduleRecipientBadge(Conversation $conversation, User $sender): void
    {
        $conversation->loadMissing('participants');
        $recipient = $conversation->otherParticipant($sender);

        if ($recipient === null) {
            return;
        }

        $recipientId = $recipient->id;
        $conversationId = $conversation->id;

        dispatch(function () use ($recipientId, $conversationId): void {
            $recipient = User::query()->find($recipientId);

            if ($recipient === null) {
                return;
            }

            try {
                broadcast(new UnreadBadgesUpdated(
                    $recipient,
                    app(UnreadMessageService::class)->countFor($recipient),
                    null,
                    $conversationId,
                ));
            } catch (Throwable $e) {
                report($e);
            }
        })->afterResponse();
    }
}

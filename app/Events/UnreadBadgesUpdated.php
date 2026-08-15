<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnreadBadgesUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public int $unreadMessagesCount,
        public int $unreadNotificationsCount,
        public ?int $conversationId = null,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->user->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'unread.badges';
    }

    /**
     * @return array<string, int>
     */
    public function broadcastWith(): array
    {
        $payload = [
            'unread_messages_count' => $this->unreadMessagesCount,
            'unread_notifications_count' => $this->unreadNotificationsCount,
        ];

        if ($this->conversationId !== null) {
            $payload['conversation_id'] = $this->conversationId;
        }

        return $payload;
    }
}

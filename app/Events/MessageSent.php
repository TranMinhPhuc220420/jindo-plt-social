<?php

namespace App\Events;

use App\Models\Message;
use App\Support\PostPresenter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
        $this->message->loadMissing(['user']);

        if ($this->message->shared_post_id !== null) {
            $this->message->loadMissing(['sharedPost.user', 'sharedPost.media']);
        }
    }

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.'.$this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'body' => $this->message->body,
            'image_url' => $this->message->imageUrl(),
            'shared_post' => $this->message->shared_post_id
                ? PostPresenter::embedSharedPost(
                    $this->message->sharedPost,
                    (int) $this->message->shared_post_id,
                )
                : null,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'username' => $this->message->user->username,
                'avatar' => $this->message->user->avatarUrl(),
            ],
        ];
    }
}

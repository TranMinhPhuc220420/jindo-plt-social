<?php

namespace App\Notifications;

use App\Enums\PostModerationStatus;
use App\Models\Post;
use App\Models\User;
use App\Notifications\Concerns\KeepsSemanticBroadcastType;
use App\Support\NotificationPresenter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostModeratedNotification extends Notification implements ShouldBroadcastNow
{
    use KeepsSemanticBroadcastType, Queueable;

    public function __construct(
        public User $actor,
        public Post $post,
        public PostModerationStatus $status,
        public ?string $reason = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approved = $this->status === PostModerationStatus::Approved;

        return [
            'type' => 'post_moderated',
            'status' => $this->status->value,
            'reason' => $this->reason ?? '',
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar' => $this->actor->avatarUrl() ?? '',
            'post_id' => $this->post->id,
            'post_image' => NotificationPresenter::postImageUrl($this->post),
            'body' => $approved
                ? __('approved your post')
                : __('rejected your post'),
            'message' => $approved
                ? __(':name approved your post', ['name' => $this->actor->name])
                : __(':name rejected your post: :reason', [
                    'name' => $this->actor->name,
                    'reason' => $this->reason ?? '',
                ]),
            'url' => route('posts.show', $this->post),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

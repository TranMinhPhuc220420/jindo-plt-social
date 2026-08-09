<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use App\Support\NotificationPresenter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostSharedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public User $actor,
        public Post $share,
        public Post $root,
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
        return [
            'type' => 'post_shared',
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar' => $this->actor->avatarUrl() ?? '',
            'post_id' => $this->root->id,
            'post_image' => NotificationPresenter::postImageUrl($this->root),
            'body' => __('shared your post'),
            'message' => __(':name shared your post', ['name' => $this->actor->name]),
            'url' => route('posts.show', $this->share),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

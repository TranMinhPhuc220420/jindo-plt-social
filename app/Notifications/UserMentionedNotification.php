<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\Concerns\KeepsSemanticBroadcastType;
use App\Support\NotificationPresenter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class UserMentionedNotification extends Notification implements ShouldBroadcastNow
{
    use KeepsSemanticBroadcastType, Queueable;

    public function __construct(
        public User $actor,
        public Post $post,
        public Model $mentionable,
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
        $inComment = $this->mentionable instanceof Comment;

        return [
            'type' => 'user_mentioned',
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar' => $this->actor->avatarUrl() ?? '',
            'post_id' => $this->post->id,
            'post_image' => NotificationPresenter::postImageUrl($this->post),
            'body' => $inComment
                ? __('mentioned you in a comment')
                : __('mentioned you in a post'),
            'message' => $inComment
                ? __(':name mentioned you in a comment', ['name' => $this->actor->name])
                : __(':name mentioned you in a post', ['name' => $this->actor->name]),
            'url' => route('posts.show', $this->post),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

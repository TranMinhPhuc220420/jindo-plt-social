<?php

namespace App\Notifications;

use App\Enums\ReactionType;
use App\Models\Post;
use App\Models\User;
use App\Notifications\Concerns\KeepsSemanticBroadcastType;
use App\Support\NotificationPresenter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldBroadcastNow
{
    use KeepsSemanticBroadcastType, Queueable;

    public function __construct(
        public User $actor,
        public Post $post,
        public ReactionType $reaction = ReactionType::Like,
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
            'type' => 'post_liked',
            'reaction' => $this->reaction->value,
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar' => $this->actor->avatarUrl() ?? '',
            'post_id' => $this->post->id,
            'post_image' => NotificationPresenter::postImageUrl($this->post),
            'body' => $this->body(),
            'message' => $this->message(),
            'url' => route('posts.show', $this->post),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    private function body(): string
    {
        return match ($this->reaction) {
            ReactionType::Like => __('liked your post'),
            ReactionType::Love => __('loved your post'),
            ReactionType::Haha => __('reacted Haha to your post'),
            ReactionType::Sad => __('reacted Sad to your post'),
            ReactionType::Celebrate => __('celebrated your post'),
            ReactionType::Support => __('supported your post'),
            ReactionType::Insightful => __('found your post insightful'),
        };
    }

    private function message(): string
    {
        return match ($this->reaction) {
            ReactionType::Like => __(':name liked your post', ['name' => $this->actor->name]),
            ReactionType::Love => __(':name loved your post', ['name' => $this->actor->name]),
            ReactionType::Haha => __(':name reacted Haha to your post', ['name' => $this->actor->name]),
            ReactionType::Sad => __(':name reacted Sad to your post', ['name' => $this->actor->name]),
            ReactionType::Celebrate => __(':name celebrated your post', ['name' => $this->actor->name]),
            ReactionType::Support => __(':name supported your post', ['name' => $this->actor->name]),
            ReactionType::Insightful => __(':name found your post insightful', ['name' => $this->actor->name]),
        };
    }
}

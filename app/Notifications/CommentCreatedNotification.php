<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Support\NotificationPresenter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class CommentCreatedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public User $actor,
        public Post $post,
        public Comment $comment,
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
        $isReply = $this->comment->parent_id !== null;

        return [
            'type' => $isReply ? 'comment_reply' : 'comment_created',
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar' => $this->actor->avatarUrl() ?? '',
            'post_id' => $this->post->id,
            'comment_id' => $this->comment->id,
            'post_image' => NotificationPresenter::postImageUrl($this->post),
            'body' => $isReply
                ? __('replied to a comment on your post')
                : __('commented on your post'),
            'message' => $isReply
                ? __(':name replied to a comment on your post', ['name' => $this->actor->name])
                : __(':name commented on your post', ['name' => $this->actor->name]),
            'url' => route('posts.show', $this->post),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

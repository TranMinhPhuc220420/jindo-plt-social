<?php

namespace App\Support;

use App\Enums\ReactionType;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationPresenter
{
    /**
     * @param  Collection<int, DatabaseNotification>|iterable<int, DatabaseNotification>  $notifications
     * @return list<array<string, mixed>>
     */
    public static function collection(iterable $notifications): array
    {
        $items = Collection::make($notifications)->values();

        $actorIds = $items
            ->map(fn (DatabaseNotification $notification) => $notification->data['actor_id'] ?? null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $postIds = $items
            ->map(fn (DatabaseNotification $notification) => $notification->data['post_id'] ?? null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        /** @var Collection<int|string, User> $actors */
        $actors = $actorIds === []
            ? collect()
            : User::query()->whereIn('id', $actorIds)->get()->keyBy('id');

        /** @var Collection<int|string, Post> $posts */
        $posts = $postIds === []
            ? collect()
            : Post::query()->with('media')->whereIn('id', $postIds)->get()->keyBy('id');

        return array_values($items
            ->map(fn (DatabaseNotification $notification) => self::toArray($notification, $actors, $posts))
            ->all());
    }

    /**
     * First ready media URL for a post, or empty string when none.
     */
    public static function postImageUrl(?Post $post): string
    {
        if ($post === null) {
            return '';
        }

        $media = $post->relationLoaded('media')
            ? $post->media
            : $post->media()->get();

        $item = $media->firstWhere('status', PostMedia::STATUS_READY) ?? $media->first();

        return $item?->url() ?? '';
    }

    /**
     * @param  Collection<int|string, User>|null  $actors
     * @param  Collection<int|string, Post>|null  $posts
     * @return array<string, mixed>
     */
    public static function toArray(
        DatabaseNotification $notification,
        ?Collection $actors = null,
        ?Collection $posts = null,
    ): array {
        $data = $notification->data;
        $actorId = $data['actor_id'] ?? null;
        $actor = $actorId !== null
            ? ($actors?->get($actorId) ?? User::query()->whereKey($actorId)->first())
            : null;

        $data['actor_avatar'] = $actor?->avatarUrl()
            ?? (is_string($data['actor_avatar'] ?? null) ? $data['actor_avatar'] : '');

        if ($actor !== null) {
            $data['actor_name'] = $actor->name;
            $data['actor_username'] = $actor->username;
        }

        if (! is_string($data['body'] ?? null) || $data['body'] === '') {
            $data['body'] = self::fallbackBody($data);
        }

        $postId = $data['post_id'] ?? null;
        if ($postId !== null) {
            $post = $posts?->get($postId)
                ?? Post::query()->with('media')->whereKey($postId)->first();
            $data['post_image'] = self::postImageUrl($post);
        } else {
            $data['post_image'] = is_string($data['post_image'] ?? null) ? $data['post_image'] : '';
        }

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? class_basename($notification->type),
            'data' => $data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function fallbackBody(array $data): string
    {
        $type = $data['type'] ?? null;
        $name = is_string($data['actor_name'] ?? null) ? $data['actor_name'] : null;
        $message = is_string($data['message'] ?? null) ? $data['message'] : null;

        if ($name !== null && $message !== null && str_starts_with($message, $name.' ')) {
            return substr($message, strlen($name) + 1);
        }

        return match ($type) {
            'post_liked' => self::reactionBody(
                is_string($data['reaction'] ?? null) ? $data['reaction'] : ReactionType::Like->value,
            ),
            'comment_created' => __('commented on your post'),
            'comment_reply' => __('replied to a comment on your post'),
            'user_followed' => __('started following you'),
            'user_mentioned' => __('mentioned you'),
            'post_shared' => __('shared your post'),
            default => $message ?? __('New notification'),
        };
    }

    private static function reactionBody(string $reaction): string
    {
        $type = ReactionType::tryFrom($reaction) ?? ReactionType::Like;

        return match ($type) {
            ReactionType::Like => __('liked your post'),
            ReactionType::Love => __('loved your post'),
            ReactionType::Haha => __('reacted Haha to your post'),
            ReactionType::Sad => __('reacted Sad to your post'),
            ReactionType::Celebrate => __('celebrated your post'),
            ReactionType::Support => __('supported your post'),
            ReactionType::Insightful => __('found your post insightful'),
        };
    }
}

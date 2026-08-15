<?php

namespace App\Support;

use App\Enums\ReactionType;
use App\Models\Like;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Report;
use App\Models\User;

class PostPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function toArray(Post $post, User $viewer): array
    {
        $media = $post->relationLoaded('media')
            ? $post->media
            : $post->media()->get();

        $mediaPayload = $media->map(fn (PostMedia $item) => [
            'id' => $item->id,
            'url' => $item->url(),
            'position' => $item->position,
            'status' => $item->status,
            'width' => $item->width,
            'height' => $item->height,
        ])->values()->all();

        $firstReady = collect($mediaPayload)->firstWhere('status', PostMedia::STATUS_READY);
        $viewerReaction = self::viewerReaction($post);

        return [
            'id' => $post->id,
            'body' => $post->body,
            'image_url' => $firstReady['url'] ?? ($mediaPayload[0]['url'] ?? null),
            'media' => $mediaPayload,
            'created_at' => $post->created_at?->toIso8601String(),
            'likes_count' => (int) ($post->likes_count ?? $post->likes()->count()),
            'comments_count' => (int) ($post->comments_count ?? $post->comments()->count()),
            'bookmarks_count' => (int) ($post->bookmarks_count ?? $post->bookmarks()->count()),
            'shares_count' => (int) ($post->shares_count ?? $post->shares()->count()),
            'reaction_counts' => self::reactionCounts($post),
            'viewer_reaction' => $viewerReaction,
            'liked_by_viewer' => $viewerReaction !== null,
            'bookmarked_by_viewer' => (bool) ($post->bookmarked_by_viewer ?? false),
            'shared_post' => self::sharedPostPayload($post),
            'moderation_status' => $post->moderation_status->value,
            'moderation_reason' => $post->moderation_reason,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'username' => $post->user->username,
                'avatar' => $post->user->avatarUrl(),
                'followed_by_viewer' => $viewer->id !== $post->user->id
                    && (bool) ($post->user->followed_by_viewer ?? false),
                'can_follow' => $viewer->can('follow', $post->user),
            ],
            'can' => [
                'update' => $viewer->can('update', $post),
                'delete' => $viewer->can('delete', $post),
                'report' => $viewer->can('create', [Report::class, $post]),
            ],
        ];
    }

    /**
     * Nested original for a share post (no recursive shared_post).
     *
     * @return array<string, mixed>|null
     */
    public static function sharedPostPayload(Post $post): ?array
    {
        if ($post->shared_post_id === null) {
            return null;
        }

        $root = $post->relationLoaded('sharedPost')
            ? $post->sharedPost
            : Post::query()->withTrashed()->with(['user', 'media'])->find($post->shared_post_id);

        return self::embedSharedPost($root, (int) $post->shared_post_id);
    }

    /**
     * Embed payload for a root post (used by feed shares and DM shares).
     *
     * @return array<string, mixed>
     */
    public static function embedSharedPost(?Post $root, int $sharedPostId): array
    {
        if ($root === null || $root->trashed() || ! $root->isApproved()) {
            return [
                'id' => $sharedPostId,
                'body' => '',
                'media' => [],
                'image_url' => null,
                'unavailable' => true,
                'user' => null,
                'created_at' => null,
            ];
        }

        $media = $root->relationLoaded('media')
            ? $root->media
            : $root->media()->get();

        $mediaPayload = $media->map(fn (PostMedia $item) => [
            'id' => $item->id,
            'url' => $item->url(),
            'position' => $item->position,
            'status' => $item->status,
            'width' => $item->width,
            'height' => $item->height,
        ])->values()->all();

        $firstReady = collect($mediaPayload)->firstWhere('status', PostMedia::STATUS_READY);

        return [
            'id' => $root->id,
            'body' => $root->body,
            'media' => $mediaPayload,
            'image_url' => $firstReady['url'] ?? ($mediaPayload[0]['url'] ?? null),
            'unavailable' => false,
            'created_at' => $root->created_at?->toIso8601String(),
            'user' => [
                'id' => $root->user->id,
                'name' => $root->user->name,
                'username' => $root->user->username,
                'avatar' => $root->user->avatarUrl(),
            ],
        ];
    }

    /**
     * @return array<string, int>
     */
    public static function reactionCounts(Post $post): array
    {
        $counts = ReactionType::emptyCounts();

        if (array_key_exists('reaction_like_count', $post->getAttributes())) {
            foreach (ReactionType::cases() as $type) {
                $counts[$type->value] = (int) ($post->{'reaction_'.$type->value.'_count'} ?? 0);
            }

            return $counts;
        }

        $rows = Like::query()
            ->where('post_id', $post->id)
            ->selectRaw('type, COUNT(*) as aggregate')
            ->groupBy('type')
            ->pluck('aggregate', 'type');

        foreach ($rows as $type => $aggregate) {
            if (is_string($type) && array_key_exists($type, $counts)) {
                $counts[$type] = (int) $aggregate;
            }
        }

        return $counts;
    }

    public static function viewerReaction(Post $post): ?string
    {
        $raw = $post->getAttribute('viewer_reaction');

        if (is_string($raw) && $raw !== '') {
            return ReactionType::tryFrom($raw)?->value;
        }

        if ($raw instanceof ReactionType) {
            return $raw->value;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function reactionPayload(Post $post, ?string $viewerReaction): array
    {
        $counts = self::reactionCounts($post);

        return [
            'viewer_reaction' => $viewerReaction,
            'liked' => $viewerReaction !== null,
            'likes_count' => (int) array_sum($counts),
            'reaction_counts' => $counts,
        ];
    }
}

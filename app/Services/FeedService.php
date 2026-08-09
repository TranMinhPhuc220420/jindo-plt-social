<?php

namespace App\Services;

use App\Enums\ReactionType;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Cache;

class FeedService
{
    /**
     * Posts by the viewer or users they follow, newest first.
     *
     * @return CursorPaginator<int, Post>
     */
    public function forUser(User $user, int $perPage = 15): CursorPaginator
    {
        $authorIds = $this->authorIdsFor($user);

        return $this->engagementQuery($user)
            ->whereIn('user_id', $authorIds)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage);
    }

    /**
     * @return list<int>
     */
    public function authorIdsFor(User $user): array
    {
        return Cache::remember(
            $this->authorsCacheKey($user->id),
            now()->addSeconds(60),
            function () use ($user): array {
                return array_values(
                    $user->following()->pluck('users.id')
                        ->push($user->id)
                        ->unique()
                        ->values()
                        ->map(fn (mixed $id): int => (int) $id)
                        ->all()
                );
            }
        );
    }

    public function forgetAuthorCache(int $userId): void
    {
        Cache::forget($this->authorsCacheKey($userId));
    }

    /**
     * @return Builder<Post>
     */
    public function engagementQuery(User $viewer): Builder
    {
        $withCount = [
            'likes',
            'comments',
            'bookmarks',
            'shares',
        ];

        foreach (ReactionType::cases() as $type) {
            $withCount['likes as reaction_'.$type->value.'_count'] = fn (Builder $query) => $query
                ->where('type', $type->value);
        }

        return Post::query()
            ->select('posts.*')
            ->with([
                'user' => fn ($query) => $query->withExists([
                    'followers as followed_by_viewer' => fn (Builder $followers) => $followers
                        ->where('follows.follower_id', $viewer->id),
                ]),
                'media',
                'sharedPost' => fn ($query) => $query->withTrashed()->with(['user', 'media']),
            ])
            ->withCount($withCount)
            ->withExists([
                'likes as liked_by_viewer' => fn (Builder $query) => $query->where('user_id', $viewer->id),
                'bookmarks as bookmarked_by_viewer' => fn (Builder $query) => $query->where('user_id', $viewer->id),
            ])
            ->addSelect([
                'viewer_reaction' => Like::query()
                    ->select('type')
                    ->whereColumn('likes.post_id', 'posts.id')
                    ->where('likes.user_id', $viewer->id)
                    ->limit(1),
            ]);
    }

    private function authorsCacheKey(int $userId): string
    {
        return "feed:authors:{$userId}";
    }
}

<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Trending posts: last 48 hours, score = likes_count * 2 + comments_count.
 * Trending tags: last 7 days by post_tag attachment count.
 */
class ExploreService
{
    public function __construct(private readonly FeedService $feedService) {}

    /**
     * @return LengthAwarePaginator<int, Post>
     */
    public function trending(User $viewer, int $perPage = 15): LengthAwarePaginator
    {
        return $this->feedService->engagementQuery($viewer)
            ->where('created_at', '>=', now()->subHours(48))
            ->orderByRaw('(likes_count * 2 + comments_count) desc')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, array{id: int, name: string, slug: string, posts_count: int}>
     */
    public function trendingTags(int $days = 7, int $limit = 10): Collection
    {
        $rows = DB::table('post_tag')
            ->select('tag_id', DB::raw('COUNT(*) as attachments_count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('tag_id')
            ->orderByDesc('attachments_count')
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return collect();
        }

        $tags = Tag::query()
            ->whereIn('id', $rows->pluck('tag_id'))
            ->get()
            ->keyBy('id');

        return $rows
            ->map(function ($row) use ($tags): ?array {
                $tag = $tags->get($row->tag_id);

                if ($tag === null) {
                    return null;
                }

                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'posts_count' => (int) $row->attachments_count,
                ];
            })
            ->filter()
            ->values();
    }
}

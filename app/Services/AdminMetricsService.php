<?php

namespace App\Services;

use App\Enums\PostModerationStatus;
use App\Enums\ReportStatus;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;

class AdminMetricsService
{
    /**
     * @return array{
     *     users_total: int,
     *     users_suspended: int,
     *     posts_total: int,
     *     posts_pending: int,
     *     posts_7d: int,
     *     likes_7d: int,
     *     comments_7d: int,
     *     messages_7d: int,
     *     conversations_total: int,
     *     reports_open: int
     * }
     */
    public function snapshot(): array
    {
        $since = now()->subDays(7);

        return [
            'users_total' => User::query()->count(),
            'users_suspended' => User::query()->whereNotNull('suspended_at')->count(),
            'posts_total' => Post::query()->count(),
            'posts_pending' => Post::query()->where('moderation_status', PostModerationStatus::Pending)->count(),
            'posts_7d' => Post::query()->where('created_at', '>=', $since)->count(),
            'likes_7d' => Like::query()->where('created_at', '>=', $since)->count(),
            'comments_7d' => Comment::query()->where('created_at', '>=', $since)->count(),
            'messages_7d' => 0,
            'conversations_total' => 0,
            'reports_open' => Report::query()->where('status', ReportStatus::Open)->count(),
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class SearchService
{
    public function __construct(private readonly FeedService $feedService) {}

    /**
     * @return Collection<int, User>
     */
    public function users(string $query, int $limit = 20): Collection
    {
        $query = trim($query);

        if ($query === '') {
            return collect();
        }

        return User::query()
            ->where(function ($builder) use ($query): void {
                $builder->where('username', 'like', $query.'%')
                    ->orWhere('name', 'like', '%'.$query.'%');
            })
            ->orderByRaw('CASE WHEN username LIKE ? THEN 0 ELSE 1 END', [$query.'%'])
            ->orderBy('username')
            ->limit($limit)
            ->get();
    }

    /**
     * @return LengthAwarePaginator<int, Post>
     */
    public function posts(string $query, User $viewer, int $perPage = 15): LengthAwarePaginator
    {
        $query = trim($query);

        if ($query === '') {
            return $this->feedService->engagementQuery($viewer)
                ->approved()
                ->whereRaw('1 = 0')
                ->paginate($perPage);
        }

        $builder = $this->feedService->engagementQuery($viewer)->approved();
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $builder->whereFullText('body', $query);
        } else {
            $builder->where('body', 'like', '%'.$query.'%');
        }

        return $builder
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, Tag>
     */
    public function tags(string $query, int $limit = 20): Collection
    {
        $query = ltrim(strtolower(trim($query)), '#');

        if ($query === '') {
            return collect();
        }

        return Tag::query()
            ->where(function ($builder) use ($query): void {
                $builder->where('slug', 'like', $query.'%')
                    ->orWhere('name', 'like', $query.'%');
            })
            ->orderBy('slug')
            ->limit($limit)
            ->get();
    }
}

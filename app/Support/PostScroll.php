<?php

namespace App\Support;

use App\Models\Post;
use App\Models\User;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\ScrollMetadata;
use Inertia\ScrollProp;

/**
 * Build an Inertia scroll prop for posts without corrupting cursor pagination.
 *
 * CursorPaginator::nextCursor() is derived from the last collection item. Mapping
 * posts through PostPresenter (ISO8601 created_at) before encoding breaks the
 * next-page cursor against SQL datetime columns.
 */
final class PostScroll
{
    /**
     * @param  CursorPaginator<int, Post>|LengthAwarePaginator<int, Post>  $posts
     * @return ScrollProp<mixed>
     */
    public static function prop(CursorPaginator|LengthAwarePaginator $posts, User $viewer): ScrollProp
    {
        $metadata = ScrollMetadata::fromPaginator($posts);

        if ($posts instanceof CursorPaginator) {
            return Inertia::scroll([
                'data' => $posts->getCollection()
                    ->map(fn (Post $post) => PostPresenter::toArray($post, $viewer))
                    ->values()
                    ->all(),
                'path' => $posts->path(),
                'per_page' => $posts->perPage(),
                'next_cursor' => $posts->nextCursor()?->encode(),
                'prev_cursor' => $posts->previousCursor()?->encode(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ], 'data', $metadata);
        }

        return Inertia::scroll(
            $posts->through(
                fn (Post $post) => PostPresenter::toArray($post, $viewer)
            ),
            'data',
            $metadata
        );
    }
}

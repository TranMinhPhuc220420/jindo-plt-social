<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Post;
use App\Services\FeedService;
use App\Support\PostPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function __construct(private readonly FeedService $feedService) {}

    public function index(Request $request): Response
    {
        $viewer = $request->user();

        $posts = $this->feedService->engagementQuery($viewer)
            ->join('bookmarks', function ($join) use ($viewer): void {
                $join->on('bookmarks.post_id', '=', 'posts.id')
                    ->where('bookmarks.user_id', '=', $viewer->id);
            })
            ->orderByDesc('bookmarks.created_at')
            ->orderByDesc('posts.id')
            ->cursorPaginate(15);

        return Inertia::render('bookmarks/index', [
            'posts' => $posts->through(
                fn (Post $post) => PostPresenter::toArray($post, $viewer)
            ),
        ]);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        abort_if($request->user()->isSuspended(), 403);

        Bookmark::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
        ]);

        return response()->json([
            'bookmarked' => true,
            'bookmarks_count' => $post->bookmarks()->count(),
        ]);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        abort_if($request->user()->isSuspended(), 403);

        Bookmark::query()
            ->where('user_id', $request->user()->id)
            ->where('post_id', $post->id)
            ->delete();

        return response()->json([
            'bookmarked' => false,
            'bookmarks_count' => $post->bookmarks()->count(),
        ]);
    }
}

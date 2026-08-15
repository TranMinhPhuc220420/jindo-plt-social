<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Services\FeedService;
use App\Support\PostPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function __construct(private readonly FeedService $feedService) {}

    public function show(Request $request, string $slug): Response
    {
        $tag = Tag::query()
            ->where('slug', strtolower($slug))
            ->firstOrFail();

        $viewer = $request->user();

        $posts = $this->feedService->engagementQuery($viewer)
            ->approved()
            ->whereHas('tags', fn ($query) => $query->where('tags.id', $tag->id))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(15);

        return Inertia::render('tags/show', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
            'posts' => $posts->through(
                fn ($post) => PostPresenter::toArray($post, $viewer)
            ),
        ]);
    }
}

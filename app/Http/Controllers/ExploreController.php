<?php

namespace App\Http\Controllers;

use App\Services\ExploreService;
use App\Support\PostScroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __construct(private readonly ExploreService $explore) {}

    public function index(Request $request): Response
    {
        $viewer = $request->user();
        $posts = $this->explore->trending($viewer);

        return Inertia::render('explore/index', [
            'posts' => PostScroll::prop($posts, $viewer),
            'trending_tags' => $this->explore->trendingTags(),
        ]);
    }
}

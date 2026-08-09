<?php

namespace App\Http\Controllers;

use App\Services\FeedService;
use App\Support\PostScroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function __construct(private readonly FeedService $feedService) {}

    public function index(Request $request): Response
    {
        $viewer = $request->user();
        $posts = $this->feedService->forUser($viewer);

        return Inertia::render('feed/index', [
            'posts' => PostScroll::prop($posts, $viewer),
        ]);
    }
}

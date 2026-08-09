<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use App\Support\PostPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __construct(private readonly SearchService $search) {}

    public function index(Request $request): Response
    {
        $q = (string) $request->string('q');
        $tab = $request->string('tab')->toString();
        $tab = in_array($tab, ['users', 'posts', 'tags'], true) ? $tab : 'users';
        $viewer = $request->user();

        $users = $tab === 'users'
            ? $this->search->users($q)->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatarUrl(),
                'bio' => $user->bio,
            ])
            : collect();

        $posts = $tab === 'posts'
            ? $this->search->posts($q, $viewer)->through(
                fn ($post) => PostPresenter::toArray($post, $viewer)
            )
            : null;

        $tags = $tab === 'tags'
            ? $this->search->tags($q)->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])
            : collect();

        return Inertia::render('search/index', [
            'query' => $q,
            'tab' => $tab,
            'users' => $users,
            'posts' => $posts,
            'tags' => $tags,
        ]);
    }
}

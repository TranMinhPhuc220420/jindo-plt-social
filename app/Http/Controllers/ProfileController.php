<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FeedService;
use App\Services\ProfileAboutPresenter;
use App\Support\PostPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly FeedService $feedService,
        private readonly ProfileAboutPresenter $aboutPresenter,
    ) {}

    public function show(Request $request, string $username): Response
    {
        $profile = User::query()
            ->where('username', $username)
            ->firstOrFail();

        $viewer = $request->user();

        $postsQuery = $this->feedService->engagementQuery($viewer)
            ->where('user_id', $profile->id);

        if ($viewer->id === $profile->id) {
            $postsQuery->visibleTo($viewer);
        } else {
            $postsQuery->approved();
        }

        $posts = $postsQuery
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(15);

        return Inertia::render('profile/show', [
            'profile' => $this->profilePayload($profile, $viewer),
            'about' => $this->aboutPresenter->visibleFields($profile, $viewer),
            'photos_preview' => $this->aboutPresenter->photosPreview($profile, 9),
            'posts' => $posts->through(
                fn ($post) => PostPresenter::toArray($post, $viewer)
            ),
        ]);
    }

    public function about(Request $request, string $username): Response
    {
        $profile = User::query()->where('username', $username)->firstOrFail();
        $viewer = $request->user();

        return Inertia::render('profile/about', [
            'profile' => $this->profilePayload($profile, $viewer),
            'about' => $this->aboutPresenter->visibleFields($profile, $viewer),
        ]);
    }

    public function photos(Request $request, string $username): Response
    {
        $profile = User::query()->where('username', $username)->firstOrFail();
        $viewer = $request->user();

        $photos = $this->aboutPresenter->photosPaginated($profile, 24);

        return Inertia::render('profile/photos', [
            'profile' => $this->profilePayload($profile, $viewer),
            'photos' => [
                'data' => $this->aboutPresenter->presentMedia($photos),
                'next_page_url' => $photos->nextPageUrl(),
                'prev_page_url' => $photos->previousPageUrl(),
            ],
        ]);
    }

    public function followers(Request $request, string $username): Response
    {
        $profile = User::query()->where('username', $username)->firstOrFail();
        $viewer = $request->user();

        $users = $profile->followers()
            ->orderByPivot('created_at', 'desc')
            ->paginate(20)
            ->through(fn (User $user) => $this->listUserPayload($user, $viewer));

        return Inertia::render('profile/followers', [
            'profile' => [
                'name' => $profile->name,
                'username' => $profile->username,
            ],
            'users' => $users,
        ]);
    }

    public function following(Request $request, string $username): Response
    {
        $profile = User::query()->where('username', $username)->firstOrFail();
        $viewer = $request->user();

        $users = $profile->following()
            ->orderByPivot('created_at', 'desc')
            ->paginate(20)
            ->through(fn (User $user) => $this->listUserPayload($user, $viewer));

        return Inertia::render('profile/following', [
            'profile' => [
                'name' => $profile->name,
                'username' => $profile->username,
            ],
            'users' => $users,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function profilePayload(User $profile, User $viewer): array
    {
        return [
            'id' => $profile->id,
            'name' => $profile->name,
            'username' => $profile->username,
            'bio' => $profile->bio,
            'avatar' => $profile->avatarUrl(),
            'cover' => $profile->coverUrl(),
            'joined_at' => $profile->created_at?->toIso8601String(),
            'followers_count' => $profile->followers()->count(),
            'following_count' => $profile->following()->count(),
            'is_own' => $viewer->id === $profile->id,
            'is_following' => $viewer->id !== $profile->id
                && $viewer->following()->where('users.id', $profile->id)->exists(),
            'can_follow' => $viewer->can('follow', $profile),
            'can_message' => $viewer->id !== $profile->id
                && $viewer->isMutualWith($profile),
        ];
    }

    /**
     * @return array{id: int, name: string, username: string, avatar: string|null, bio: string|null, is_following: bool, can_follow: bool}
     */
    private function listUserPayload(User $user, User $viewer): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatarUrl(),
            'bio' => $user->bio,
            'is_following' => $viewer->id !== $user->id
                && $viewer->following()->where('users.id', $user->id)->exists(),
            'can_follow' => $viewer->can('follow', $user),
        ];
    }
}

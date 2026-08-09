<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use App\Notifications\UserFollowedNotification;
use App\Services\FeedService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FollowController extends Controller
{
    public function __construct(private readonly FeedService $feedService) {}

    public function store(Request $request, string $username): RedirectResponse
    {
        $target = User::query()->where('username', $username)->firstOrFail();

        $this->authorize('follow', $target);

        $follow = Follow::query()->firstOrCreate([
            'follower_id' => $request->user()->id,
            'following_id' => $target->id,
        ]);

        if ($follow->wasRecentlyCreated) {
            $target->notify(new UserFollowedNotification($request->user()));
            $this->feedService->forgetAuthorCache($request->user()->id);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Following @:username', ['username' => $target->username])]);

        return back();
    }

    public function destroy(Request $request, string $username): RedirectResponse
    {
        $target = User::query()->where('username', $username)->firstOrFail();

        Follow::query()
            ->where('follower_id', $request->user()->id)
            ->where('following_id', $target->id)
            ->delete();

        $this->feedService->forgetAuthorCache($request->user()->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Unfollowed @:username', ['username' => $target->username])]);

        return back();
    }
}

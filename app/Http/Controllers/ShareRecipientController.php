<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShareRecipientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $viewer = $request->user();
        $q = trim((string) $request->query('q', ''));
        $viewerId = $viewer->id;

        $followingIds = $viewer->following()->pluck('users.id');

        $query = User::query()
            ->whereIn('users.id', $followingIds)
            ->whereNull('users.suspended_at')
            ->whereExists(function ($builder) use ($viewerId): void {
                $builder->selectRaw('1')
                    ->from('follows')
                    ->whereColumn('follows.follower_id', 'users.id')
                    ->where('follows.following_id', $viewerId);
            })
            ->orderBy('users.name')
            ->limit(20);

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($builder) use ($like): void {
                $builder->where('users.name', 'like', $like)
                    ->orWhere('users.username', 'like', $like);
            });
        }

        $recipients = $query->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatarUrl(),
        ])->values()->all();

        return response()->json(['data' => $recipients]);
    }
}

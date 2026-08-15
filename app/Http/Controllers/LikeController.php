<?php

namespace App\Http\Controllers;

use App\Enums\ReactionType;
use App\Models\Like;
use App\Models\Post;
use App\Notifications\PostLikedNotification;
use App\Support\PostPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LikeController extends Controller
{
    public function store(Request $request, Post $post): JsonResponse
    {
        $this->authorize('engage', $post);

        abort_if($request->user()->isSuspended(), 403);

        $validated = $request->validate([
            'type' => ['sometimes', 'string', Rule::enum(ReactionType::class)],
        ]);

        $type = ReactionType::from($validated['type'] ?? ReactionType::Like->value);

        $like = Like::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
        ]);

        $wasNew = ! $like->exists;
        $like->type = $type;
        $like->save();

        $post->loadMissing('user');

        if ($wasNew && $post->user_id !== $request->user()->id) {
            $post->user->notify(new PostLikedNotification($request->user(), $post, $type));
        }

        return response()->json(
            PostPresenter::reactionPayload($post->fresh(), $type->value)
        );
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        $this->authorize('engage', $post);

        abort_if($request->user()->isSuspended(), 403);

        Like::query()
            ->where('user_id', $request->user()->id)
            ->where('post_id', $post->id)
            ->delete();

        return response()->json(
            PostPresenter::reactionPayload($post->fresh(), null)
        );
    }
}

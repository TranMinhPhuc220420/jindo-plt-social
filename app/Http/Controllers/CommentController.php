<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Notifications\CommentCreatedNotification;
use App\Services\MentionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function __construct(private readonly MentionService $mentions) {}

    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $request->validated('parent_id'),
            'body' => $request->validated('body'),
        ]);

        $this->mentions->syncFor($comment, $request->user(), $comment->body);

        $post->loadMissing('user');
        $actor = $request->user();

        if ($post->user_id !== $actor->id) {
            $post->user->notify(new CommentCreatedNotification($actor, $post, $comment));
        }

        if ($comment->parent_id !== null) {
            $comment->loadMissing('parent.user');
            $parentAuthor = $comment->parent?->user;

            if (
                $parentAuthor !== null
                && $parentAuthor->id !== $actor->id
                && $parentAuthor->id !== $post->user_id
            ) {
                $parentAuthor->notify(new CommentCreatedNotification($actor, $post, $comment));
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Comment added.')]);

        return back();
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Comment deleted.')]);

        return back();
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\SharePostMessageRequest;
use App\Http\Requests\StoreSharePostRequest;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostSharedNotification;
use App\Services\ConversationService;
use App\Services\FeedService;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Services\PostModerationService;
use App\Support\PostPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use InvalidArgumentException;

class PostShareController extends Controller
{
    public function __construct(
        private readonly FeedService $feedService,
        private readonly MentionService $mentions,
        private readonly HashtagService $hashtags,
        private readonly ConversationService $conversations,
        private readonly PostModerationService $moderation,
    ) {}

    public function store(StoreSharePostRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('engage', $post);

        $root = Post::shareRoot($post);

        if ($root->trashed()) {
            abort(404);
        }

        $this->authorize('engage', $root);

        $validated = $request->validated();
        $body = is_string($validated['body'] ?? null) ? $validated['body'] : '';
        $actor = $request->user();

        $share = $actor->posts()->create([
            'body' => $body,
            'shared_post_id' => $root->id,
            ...$this->moderation->attributesForWriter($actor),
        ]);

        if ($body !== '') {
            $this->mentions->syncFor($share, $actor, $body);
            $this->hashtags->syncFor($share, $body);
        }

        $this->feedService->forgetAuthorCache($actor->id);

        $root->loadMissing('user');

        if ($share->isApproved() && $root->user->id !== $actor->id) {
            $root->user->notify(new PostSharedNotification($actor, $share, $root));
        }

        $message = $share->isApproved()
            ? __('Post shared.')
            : __('Share submitted for review.');

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('feed');
    }

    public function storeMessage(SharePostMessageRequest $request, Post $post): RedirectResponse|JsonResponse
    {
        $this->authorize('engage', $post);

        $root = Post::shareRoot($post);

        if ($root->trashed()) {
            abort(404);
        }

        $this->authorize('engage', $root);

        $root->loadMissing(['user', 'media']);

        $body = $request->validated('body');
        $body = is_string($body) ? $body : null;
        $actor = $request->user();
        $sent = [];

        foreach ($request->validated('usernames') as $username) {
            $target = User::query()->where('username', $username)->firstOrFail();

            try {
                $conversationId = $this->conversations->ensureBetween($actor, $target);
            } catch (InvalidArgumentException) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => __('You can only message mutual followers.'),
                    ], 422);
                }

                return back()->withErrors([
                    'usernames' => __('You can only message mutual followers.'),
                ]);
            }

            $sent[] = [
                'id' => $conversationId,
                'other_user' => [
                    'id' => $target->id,
                    'name' => $target->name,
                    'username' => $target->username,
                    'avatar' => $target->avatarUrl(),
                ],
                'body' => $body !== '' ? $body : null,
                'shared_post' => PostPresenter::embedSharedPost($root, $root->id),
                'created_at' => now()->toIso8601String(),
                'user' => [
                    'id' => $actor->id,
                    'name' => $actor->name,
                    'username' => $actor->username,
                    'avatar' => $actor->avatarUrl(),
                ],
            ];
        }

        if ($request->expectsJson()) {
            return response()->json(['conversations' => $sent]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post sent.')]);

        return back();
    }
}

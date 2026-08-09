<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UnreadBadgesUpdated;
use App\Http\Requests\SharePostMessageRequest;
use App\Http\Requests\StoreSharePostRequest;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostSharedNotification;
use App\Services\ConversationService;
use App\Services\FeedService;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Services\UnreadMessageService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use InvalidArgumentException;
use Throwable;

class PostShareController extends Controller
{
    public function __construct(
        private readonly FeedService $feedService,
        private readonly MentionService $mentions,
        private readonly HashtagService $hashtags,
        private readonly ConversationService $conversations,
        private readonly UnreadMessageService $unreadMessages,
    ) {}

    public function store(StoreSharePostRequest $request, Post $post): RedirectResponse
    {
        $root = Post::shareRoot($post);

        if ($root->trashed()) {
            abort(404);
        }

        $validated = $request->validated();
        $body = is_string($validated['body'] ?? null) ? $validated['body'] : '';

        $share = $request->user()->posts()->create([
            'body' => $body,
            'shared_post_id' => $root->id,
        ]);

        if ($body !== '') {
            $this->mentions->syncFor($share, $request->user(), $body);
            $this->hashtags->syncFor($share, $body);
        }

        $this->feedService->forgetAuthorCache($request->user()->id);

        $root->loadMissing('user');

        if ($root->user->id !== $request->user()->id) {
            $root->user->notify(new PostSharedNotification($request->user(), $share, $root));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post shared.')]);

        return to_route('feed');
    }

    public function storeMessage(SharePostMessageRequest $request, Post $post): RedirectResponse
    {
        $root = Post::shareRoot($post);

        if ($root->trashed()) {
            abort(404);
        }

        $body = $request->validated('body');
        $body = is_string($body) ? $body : null;
        $actor = $request->user();

        foreach ($request->validated('usernames') as $username) {
            $target = User::query()->where('username', $username)->firstOrFail();

            try {
                $conversation = $this->conversations->findOrCreateBetween($actor, $target);
            } catch (InvalidArgumentException) {
                return back()->withErrors([
                    'usernames' => __('You can only message mutual followers.'),
                ]);
            }

            $message = $conversation->messages()->create([
                'user_id' => $actor->id,
                'body' => $body !== '' ? $body : null,
                'shared_post_id' => $root->id,
            ]);

            $conversation->touch();

            try {
                broadcast(new MessageSent($message))->toOthers();
            } catch (Throwable $e) {
                report($e);
            }

            $conversation->loadMissing('participants');
            $recipient = $conversation->otherParticipant($actor);

            if ($recipient) {
                try {
                    broadcast(new UnreadBadgesUpdated(
                        $recipient,
                        $this->unreadMessages->countFor($recipient),
                        null,
                        $conversation->id,
                    ));
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post sent.')]);

        return back();
    }
}

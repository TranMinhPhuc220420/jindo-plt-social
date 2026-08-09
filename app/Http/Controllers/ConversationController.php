<?php

namespace App\Http\Controllers;

use App\Events\UnreadBadgesUpdated;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\ConversationService;
use App\Services\UnreadMessageService;
use App\Support\PostPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use Throwable;

class ConversationController extends Controller
{
    public function __construct(
        private readonly ConversationService $conversations,
        private readonly UnreadMessageService $unreadMessages,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $viewer = $request->user();

        $latest = $viewer->conversations()
            ->latest('updated_at')
            ->first();

        if ($latest && ! $request->boolean('inbox')) {
            return redirect()->route('messages.show', $latest);
        }

        return Inertia::render('messages/index', [
            'conversations' => $this->conversationSummaries($viewer),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'exists:users,username'],
        ]);

        $target = User::query()->where('username', $validated['username'])->firstOrFail();

        try {
            $conversation = $this->conversations->findOrCreateBetween($request->user(), $target);
        } catch (InvalidArgumentException) {
            return back()->withErrors([
                'username' => __('You can only message mutual followers.'),
            ]);
        }

        return to_route('messages.show', $conversation);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorize('view', $conversation);

        $viewer = $request->user();
        $conversation->load('participants');

        $this->markInboundMessagesRead($viewer, $conversation);

        $messages = $conversation->messages()
            ->with(['user', 'sharedPost.user', 'sharedPost.media'])
            ->oldest()
            ->get()
            ->map(fn (Message $message) => [
                'id' => $message->id,
                'body' => $message->body,
                'image_url' => $message->imageUrl(),
                'shared_post' => $message->shared_post_id
                    ? PostPresenter::embedSharedPost($message->sharedPost, (int) $message->shared_post_id)
                    : null,
                'read_at' => $message->read_at?->toIso8601String(),
                'created_at' => $message->created_at?->toIso8601String(),
                'user' => [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                    'username' => $message->user->username,
                    'avatar' => $message->user->avatarUrl(),
                ],
                'is_mine' => $message->user_id === $viewer->id,
            ]);

        $other = $conversation->otherParticipant($viewer);

        return Inertia::render('messages/show', [
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => $other ? [
                    'id' => $other->id,
                    'name' => $other->name,
                    'username' => $other->username,
                    'avatar' => $other->avatarUrl(),
                ] : null,
            ],
            'messages' => $messages,
            'conversations' => $this->conversationSummaries($viewer),
        ]);
    }

    /**
     * Mark inbound messages read while the viewer stays on the thread (live).
     */
    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $count = $this->markInboundMessagesRead($request->user(), $conversation);

        return response()->json([
            'unread_messages_count' => $count,
        ]);
    }

    public function typing(Request $request, Conversation $conversation): HttpResponse
    {
        $this->authorize('view', $conversation);

        try {
            broadcast(new UserTyping($conversation->id, $request->user()))->toOthers();
        } catch (Throwable $e) {
            report($e);
        }

        return response()->noContent();
    }

    /**
     * Mark the other participant's unread messages as read and refresh badges.
     */
    private function markInboundMessagesRead(User $viewer, Conversation $conversation): int
    {
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $viewer->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $count = $this->unreadMessages->countFor($viewer);

        try {
            broadcast(new UnreadBadgesUpdated(
                $viewer,
                $count,
                null,
                $conversation->id,
            ));
        } catch (Throwable $e) {
            report($e);
        }

        return $count;
    }

    /**
     * @return array<int, array{id: int, other_user: array{id: int, name: string, username: string, avatar: string|null}|null, last_message: array{body: string|null, created_at: string|null}|null, unread_count: int}>
     */
    private function conversationSummaries(User $viewer): array
    {
        return $viewer->conversations()
            ->with([
                'participants',
                'messages' => fn ($query) => $query->latest()->limit(1),
            ])
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('user_id', '!=', $viewer->id)
                    ->whereNull('read_at'),
            ])
            ->latest('updated_at')
            ->get()
            ->map(function (Conversation $conversation) use ($viewer) {
                $other = $conversation->otherParticipant($viewer);
                $last = $conversation->messages->first();
                $unreadCount = (int) $conversation->getAttributes()['unread_count'];

                return [
                    'id' => $conversation->id,
                    'other_user' => $other ? [
                        'id' => $other->id,
                        'name' => $other->name,
                        'username' => $other->username,
                        'avatar' => $other->avatarUrl(),
                    ] : null,
                    'last_message' => $last ? [
                        'body' => $last->shared_post_id && ($last->body === null || $last->body === '')
                            ? 'Shared a post'
                            : $last->body,
                        'created_at' => $last->created_at?->toIso8601String(),
                    ] : null,
                    'unread_count' => $unreadCount,
                ];
            })
            ->values()
            ->all();
    }
}

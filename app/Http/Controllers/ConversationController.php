<?php

namespace App\Http\Controllers;

use App\Events\UserTyping;
use App\Http\Requests\EnsureConversationRequest;
use App\Models\User;
use App\Services\ConversationService;
use App\Services\Firebase\ConversationMemberSync;
use App\Support\ConversationId;
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
    ) {}

    public function index(): Response
    {
        return Inertia::render('messages/index', [
            'conversations' => [],
        ]);
    }

    public function ensure(EnsureConversationRequest $request): RedirectResponse|JsonResponse
    {
        $target = User::query()
            ->where('username', $request->validated('username'))
            ->firstOrFail();

        $viewer = $request->user();
        abort_unless($viewer instanceof User, 403);

        try {
            $conversationId = $this->conversations->ensureBetween($viewer, $target);
        } catch (InvalidArgumentException) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => __('You can only message mutual followers.'),
                ], 422);
            }

            return back()->withErrors([
                'username' => __('You can only message mutual followers.'),
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'id' => $conversationId,
                'other_user' => $this->presentUser($target),
            ]);
        }

        return to_route('messages.show', $conversationId);
    }

    public function show(Request $request, string $conversation): Response
    {
        $viewer = $request->user();
        abort_unless($viewer instanceof User, 403);

        $pair = ConversationId::parse($conversation);

        if ($pair === null) {
            abort(404);
        }

        if (! ConversationId::contains($conversation, (int) $viewer->id)) {
            abort(403);
        }

        $otherId = ConversationId::otherId($conversation, (int) $viewer->id);
        $other = $otherId !== null ? User::query()->find($otherId) : null;

        if ($other === null) {
            abort(404);
        }

        if (! $viewer->isMutualWith($other)) {
            abort(403);
        }

        $conversationId = $conversation;
        $viewerId = (int) $viewer->id;
        $peerId = (int) $other->id;

        dispatch(function () use ($conversationId, $viewerId, $peerId): void {
            app(ConversationMemberSync::class)->syncPair($conversationId, $viewerId, $peerId);
        })->afterResponse();

        return Inertia::render('messages/show', [
            'conversation' => [
                'id' => $conversation,
                'other_user' => $this->presentUser($other),
            ],
            'messages' => [],
            'conversations' => [],
        ]);
    }

    public function typing(Request $request, string $conversation): HttpResponse
    {
        $viewer = $request->user();
        abort_unless($viewer instanceof User, 403);

        if (! ConversationId::contains($conversation, (int) $viewer->id)) {
            abort(403);
        }

        try {
            broadcast(new UserTyping($conversation, $viewer))->toOthers();
        } catch (Throwable $e) {
            report($e);
        }

        return response()->noContent();
    }

    /**
     * @return array{id: int, name: string, username: string, avatar: string|null}
     */
    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatarUrl(),
        ];
    }
}

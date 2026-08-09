<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UnreadBadgesUpdated;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\UnreadMessageService;
use App\Support\MediaDisk;
use Illuminate\Http\RedirectResponse;
use Throwable;

class MessageController extends Controller
{
    public function __construct(private readonly UnreadMessageService $unreadMessages) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('create', [Message::class, $conversation]);

        $path = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('messages', MediaDisk::name());
        }

        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'image_path' => $path,
        ]);

        $conversation->touch();

        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (Throwable $e) {
            // Reverb/Redis may be down in local — never fail the send itself.
            report($e);
        }

        $conversation->loadMissing('participants');
        $recipient = $conversation->otherParticipant($request->user());

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

        return to_route('messages.show', $conversation);
    }
}

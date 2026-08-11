<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Messaging\MessageBroadcaster;
use App\Support\MediaDisk;
use App\Support\MessagePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class MessageController extends Controller
{
    public function __construct(private readonly MessageBroadcaster $broadcaster) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse|JsonResponse
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

        $this->broadcaster->publishSent($message);
        $this->broadcaster->scheduleRecipientBadge($conversation, $request->user());

        if ($request->expectsJson()) {
            return response()->json(
                MessagePresenter::toChatArray($message, $request->user()),
                201,
            );
        }

        return to_route('messages.show', $conversation);
    }
}

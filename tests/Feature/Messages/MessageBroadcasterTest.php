<?php

use App\Models\User;
use App\Services\ConversationService;
use App\Services\Firebase\ConversationMemberSync;
use App\Services\Messaging\MessageBroadcaster;
use Illuminate\Support\Facades\Event;
use Mockery;

afterEach(function () {
    Mockery::close();
});

test('publishSent syncs conversation members before broadcasting', function () {
    Event::fake();

    $a = User::factory()->create();
    $b = User::factory()->create();
    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $message = $conversation->messages()->create([
        'user_id' => $a->id,
        'body' => 'member sync on send',
    ]);

    $memberSync = Mockery::mock(ConversationMemberSync::class);
    $memberSync
        ->shouldReceive('sync')
        ->once()
        ->withArgs(fn ($arg) => (int) $arg->id === (int) $conversation->id);

    $this->instance(ConversationMemberSync::class, $memberSync);

    app(MessageBroadcaster::class)->publishSent($message->fresh(['conversation.participants']));
});

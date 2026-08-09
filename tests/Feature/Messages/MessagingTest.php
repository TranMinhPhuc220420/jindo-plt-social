<?php

use App\Events\MessageSent;
use App\Events\UnreadBadgesUpdated;
use App\Events\UserTyping;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Support\Facades\Event;

test('non mutual users cannot start a conversation', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);

    $this->actingAs($a)
        ->from(route('messages.index'))
        ->post(route('messages.store'), [
            'username' => $b->username,
        ])
        ->assertRedirect(route('messages.index'))
        ->assertSessionHasErrors('username');
});

test('mutual followers can message each other', function () {
    Event::fake([MessageSent::class, UnreadBadgesUpdated::class]);

    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $this->actingAs($a)
        ->post(route('messages.store'), [
            'username' => $b->username,
        ])
        ->assertRedirect();

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $this->actingAs($a)
        ->from(route('messages.show', $conversation))
        ->post(route('messages.messages.store', $conversation), [
            'body' => 'Hello mutual friend',
        ])
        ->assertRedirect(route('messages.show', $conversation));

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $a->id,
        'body' => 'Hello mutual friend',
    ]);

    Event::assertDispatched(MessageSent::class);
    Event::assertDispatched(UnreadBadgesUpdated::class, function (UnreadBadgesUpdated $event) use ($b, $conversation) {
        return $event->user->is($b)
            && $event->unreadMessagesCount === 1
            && $event->conversationId === $conversation->id;
    });
});

test('marking a thread read while viewing clears unread for that conversation', function () {
    Event::fake([UnreadBadgesUpdated::class]);

    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $conversation->messages()->create([
        'user_id' => $a->id,
        'body' => 'Ping',
    ]);

    $this->actingAs($b)
        ->post(route('messages.read', $conversation))
        ->assertOk()
        ->assertJson(['unread_messages_count' => 0]);

    expect(
        $conversation->messages()->whereNull('read_at')->count()
    )->toBe(0);

    Event::assertDispatched(UnreadBadgesUpdated::class, function (UnreadBadgesUpdated $event) use ($b, $conversation) {
        return $event->user->is($b)
            && $event->unreadMessagesCount === 0
            && $event->conversationId === $conversation->id;
    });
});

test('sending a message still succeeds when broadcasting fails', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $this->mock(BroadcastManager::class, function ($mock) {
        $mock->shouldReceive('event')->andThrow(new RuntimeException('reverb unavailable'));
    });

    $this->actingAs($a)
        ->from(route('messages.show', $conversation))
        ->post(route('messages.messages.store', $conversation), [
            'body' => 'Survives broadcast outage',
        ])
        ->assertRedirect(route('messages.show', $conversation));

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'body' => 'Survives broadcast outage',
    ]);
});

test('non participants cannot view a conversation', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $c = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $this->actingAs($c)
        ->get(route('messages.show', $conversation))
        ->assertForbidden();
});

test('messages index redirects to the latest conversation', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $c = User::factory()->create();

    $a->following()->attach([$b->id, $c->id]);
    $b->following()->attach($a->id);
    $c->following()->attach($a->id);

    $service = app(ConversationService::class);
    $older = $service->findOrCreateBetween($a, $b);
    $newer = $service->findOrCreateBetween($a, $c);

    $older->forceFill(['updated_at' => now()->subMinute()])->save();
    $newer->forceFill(['updated_at' => now()])->save();

    $this->actingAs($a)
        ->get(route('messages.index'))
        ->assertRedirect(route('messages.show', $newer));
});

test('messages index shows empty inbox when there are no conversations', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/index')
            ->has('conversations', 0));
});

test('messages index can force inbox list without redirect', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $this->actingAs($a)
        ->get(route('messages.index', ['inbox' => 1]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/index')
            ->has('conversations', 1)
            ->where('conversations.0.id', $conversation->id)
            ->where('conversations.0.unread_count', 0));
});

test('typing broadcasts for participants', function () {
    Event::fake([UserTyping::class]);

    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $this->actingAs($a)
        ->post(route('messages.typing', $conversation))
        ->assertNoContent();

    Event::assertDispatched(UserTyping::class);

    $this->actingAs($a)
        ->get(route('messages.show', $conversation))
        ->assertOk();
});

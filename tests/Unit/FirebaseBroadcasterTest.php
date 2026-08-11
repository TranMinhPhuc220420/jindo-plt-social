<?php

use App\Broadcasting\FirebaseBroadcaster;
use App\Services\Firebase\FirebaseRealtimePublisher;
use Illuminate\Notifications\Events\BroadcastNotificationCreated;
use Mockery;

afterEach(function () {
    Mockery::close();
});

test('firebase broadcaster maps message.sent to conversation message path', function () {
    $publisher = Mockery::mock(FirebaseRealtimePublisher::class);
    $publisher->shouldReceive('enabled')->andReturn(true);
    $publisher->shouldReceive('set')
        ->once()
        ->with(
            'realtime/conversations/42/events/message',
            Mockery::on(fn (array $payload) => ($payload['id'] ?? null) === 99),
        );

    $broadcaster = new FirebaseBroadcaster($publisher);
    $broadcaster->publishToChannel(
        'private-conversation.42',
        'message.sent',
        ['id' => 99, 'body' => 'hi'],
    );
});

test('firebase broadcaster maps unread.badges to user badges path', function () {
    $publisher = Mockery::mock(FirebaseRealtimePublisher::class);
    $publisher->shouldReceive('enabled')->andReturn(true);
    $publisher->shouldReceive('update')
        ->once()
        ->with(
            'realtime/users/7/badges',
            ['unread_messages_count' => 3],
        );

    $broadcaster = new FirebaseBroadcaster($publisher);
    $broadcaster->publishToChannel(
        'private-App.Models.User.7',
        'unread.badges',
        ['unread_messages_count' => 3],
    );
});

test('firebase broadcaster maps notification events to user notification path', function () {
    $publisher = Mockery::mock(FirebaseRealtimePublisher::class);
    $publisher->shouldReceive('enabled')->andReturn(true);
    $publisher->shouldReceive('set')
        ->once()
        ->with(
            'realtime/users/7/events/notification',
            Mockery::on(fn (array $payload) => ($payload['id'] ?? null) === 'n1'),
        );

    $broadcaster = new FirebaseBroadcaster($publisher);
    $broadcaster->publishToChannel(
        'private-App.Models.User.7',
        BroadcastNotificationCreated::class,
        ['id' => 'n1', 'type' => 'post_liked'],
    );
});

test('firebase broadcaster maps user.typing to typing path', function () {
    $publisher = Mockery::mock(FirebaseRealtimePublisher::class);
    $publisher->shouldReceive('enabled')->andReturn(true);
    $publisher->shouldReceive('set')
        ->once()
        ->with(
            'realtime/conversations/5/typing/11',
            Mockery::on(fn (array $payload) => ($payload['name'] ?? null) === 'Ada'),
        );

    $broadcaster = new FirebaseBroadcaster($publisher);
    $broadcaster->publishToChannel(
        'private-conversation.5',
        'user.typing',
        [
            'user' => [
                'id' => 11,
                'name' => 'Ada',
                'username' => 'ada',
            ],
        ],
    );
});

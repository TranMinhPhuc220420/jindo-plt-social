<?php

use App\Models\Mention;
use App\Models\Post;
use App\Models\User;
use App\Notifications\UserMentionedNotification;
use App\Services\MentionService;
use Illuminate\Support\Facades\Notification;

test('creating a post with an at-mention stores the mention without notifying until approval', function () {
    Notification::fake();

    $author = User::factory()->create(['username' => 'author1']);
    $mentioned = User::factory()->create(['username' => 'alice42']);

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Hello @alice42 how are you?',
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('mentions', [
        'actor_id' => $author->id,
        'mentioned_user_id' => $mentioned->id,
        'mentionable_type' => Post::class,
    ]);

    Notification::assertNotSentTo($mentioned, UserMentionedNotification::class);
});

test('self mentions do not notify', function () {
    Notification::fake();

    $author = User::factory()->create(['username' => 'soloist']);

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Talking to @soloist again',
        ])
        ->assertRedirect(route('feed'));

    expect(Mention::query()->count())->toBe(0);
    Notification::assertNothingSent();
});

test('invalid usernames are ignored', function () {
    Notification::fake();

    $author = User::factory()->create();

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Hello @no_such_user_zzz',
        ])
        ->assertRedirect(route('feed'));

    expect(Mention::query()->count())->toBe(0);
    Notification::assertNothingSent();
});

test('updating a post re-syncs mentions', function () {
    Notification::fake();

    $author = User::factory()->create(['username' => 'author1']);
    $first = User::factory()->create(['username' => 'alice42']);
    $second = User::factory()->create(['username' => 'bob99']);

    $post = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Hi @alice42',
    ]);

    app(MentionService::class)->syncFor($post, $author, $post->body);

    Notification::assertSentTo($first, UserMentionedNotification::class);

    $this->actingAs($author)
        ->patch(route('posts.update', $post), [
            'body' => 'Now @bob99 instead',
        ])
        ->assertRedirect();

    expect(
        Mention::query()
            ->where('mentionable_id', $post->id)
            ->where('mentioned_user_id', $first->id)
            ->exists()
    )->toBeFalse();

    expect(
        Mention::query()
            ->where('mentionable_id', $post->id)
            ->where('mentioned_user_id', $second->id)
            ->exists()
    )->toBeTrue();

    Notification::assertNotSentTo($second, UserMentionedNotification::class);
});

test('comment mentions notify the mentioned user', function () {
    Notification::fake();

    $author = User::factory()->create();
    $mentioned = User::factory()->create(['username' => 'alice42']);
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($author)
        ->post(route('comments.store', $post), [
            'body' => 'Ping @alice42',
        ])
        ->assertRedirect();

    Notification::assertSentTo($mentioned, UserMentionedNotification::class);
});

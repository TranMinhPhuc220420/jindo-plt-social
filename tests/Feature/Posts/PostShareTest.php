<?php

use App\Models\Post;
use App\Models\User;
use App\Notifications\PostSharedNotification;
use Illuminate\Support\Facades\Notification;

test('users can share a post to their feed with empty caption', function () {
    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id, 'body' => 'Original post']);

    Notification::fake();

    $this->actingAs($sharer)
        ->post(route('posts.share', $post), [
            'body' => '',
        ])
        ->assertRedirect(route('feed'));

    $share = Post::query()->where('user_id', $sharer->id)->where('shared_post_id', $post->id)->first();

    expect($share)->not->toBeNull()
        ->and($share->body)->toBe('')
        ->and($share->shared_post_id)->toBe($post->id);

    Notification::assertSentTo($author, PostSharedNotification::class);
    Notification::assertNotSentTo($sharer, PostSharedNotification::class);
});

test('sharing a share flattens to the root post', function () {
    $author = User::factory()->create();
    $first = User::factory()->create();
    $second = User::factory()->create();
    $root = Post::factory()->create(['user_id' => $author->id]);
    $mid = Post::factory()->create([
        'user_id' => $first->id,
        'body' => 'Mid share',
        'shared_post_id' => $root->id,
    ]);

    $this->actingAs($second)
        ->post(route('posts.share', $mid), [
            'body' => 'Flattened',
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('posts', [
        'user_id' => $second->id,
        'body' => 'Flattened',
        'shared_post_id' => $root->id,
    ]);
});

test('sharing own post does not notify self', function () {
    $author = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    Notification::fake();

    $this->actingAs($author)
        ->post(route('posts.share', $post), ['body' => 'Self share'])
        ->assertRedirect(route('feed'));

    Notification::assertNothingSent();
});

test('cannot share a soft-deleted post', function () {
    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);
    $post->delete();

    $this->actingAs($sharer)
        ->post(route('posts.share', $post), ['body' => 'Nope'])
        ->assertNotFound();
});

test('shares count increments on the root post', function () {
    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($sharer)
        ->post(route('posts.share', $post), ['body' => 'Shared']);

    expect($post->fresh()->shares()->count())->toBe(1);
});

test('deleting a share decrements shares count', function () {
    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($sharer)
        ->post(route('posts.share', $post), ['body' => 'Shared']);

    $share = Post::query()->where('shared_post_id', $post->id)->firstOrFail();

    $this->actingAs($sharer)
        ->delete(route('posts.destroy', $share))
        ->assertRedirect();

    expect($post->fresh()->shares()->count())->toBe(0);
});

test('mutual followers can share a post via messages', function () {
    $author = User::factory()->create();
    $sender = User::factory()->create();
    $recipient = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $sender->following()->attach($recipient->id);
    $recipient->following()->attach($sender->id);

    $this->actingAs($sender)
        ->post(route('posts.share-message', $post), [
            'usernames' => [$recipient->username],
            'body' => 'Check this out',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'user_id' => $sender->id,
        'body' => 'Check this out',
        'shared_post_id' => $post->id,
    ]);
});

test('non-mutual users cannot receive a shared post via messages', function () {
    $author = User::factory()->create();
    $sender = User::factory()->create();
    $stranger = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $sender->following()->attach($stranger->id);

    $this->actingAs($sender)
        ->post(route('posts.share-message', $post), [
            'usernames' => [$stranger->username],
        ])
        ->assertSessionHasErrors('usernames.0');
});

test('share recipients endpoint returns mutual followers', function () {
    $viewer = User::factory()->create();
    $mutual = User::factory()->create(['name' => 'Mutual Friend', 'username' => 'mutual_friend']);
    $oneWay = User::factory()->create(['username' => 'one_way']);

    $viewer->following()->attach([$mutual->id, $oneWay->id]);
    $mutual->following()->attach($viewer->id);

    $response = $this->actingAs($viewer)
        ->getJson(route('share-recipients.index'))
        ->assertOk();

    $usernames = collect($response->json('data'))->pluck('username')->all();

    expect($usernames)->toContain('mutual_friend')
        ->and($usernames)->not->toContain('one_way');
});

test('authors can edit share caption without media', function () {
    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $root = Post::factory()->create(['user_id' => $author->id]);
    $share = Post::factory()->create([
        'user_id' => $sharer->id,
        'body' => 'Old caption',
        'shared_post_id' => $root->id,
    ]);

    $this->actingAs($sharer)
        ->patch(route('posts.update', $share), [
            'body' => 'New caption',
        ])
        ->assertRedirect();

    expect($share->fresh()->body)->toBe('New caption')
        ->and($share->fresh()->shared_post_id)->toBe($root->id);
});

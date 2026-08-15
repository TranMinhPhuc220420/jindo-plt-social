<?php

use App\Enums\PostModerationStatus;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostModeratedNotification;
use App\Notifications\PostSharedNotification;
use App\Notifications\UserMentionedNotification;
use App\Services\HashtagService;
use Illuminate\Support\Facades\Notification;

test('member posts start pending and do not appear on another users feed', function () {
    $author = User::factory()->create();
    $follower = User::factory()->create();
    $follower->following()->attach($author->id);

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Waiting for review hello',
        ])
        ->assertRedirect(route('feed'));

    $post = Post::query()->first();

    expect($post)->not->toBeNull()
        ->and($post->moderation_status)->toBe(PostModerationStatus::Pending);

    $this->actingAs($author)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.body', 'Waiting for review hello')
            ->where('posts.data.0.moderation_status', 'pending'));

    $this->actingAs($follower)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('posts.data', 0));
});

test('strangers cannot view a pending post url but the author and admin can', function () {
    $author = User::factory()->create();
    $stranger = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->pending()->create([
        'user_id' => $author->id,
        'body' => 'Secret pending',
    ]);

    $this->actingAs($stranger)
        ->get(route('posts.show', $post))
        ->assertForbidden();

    $this->actingAs($author)
        ->get(route('posts.show', $post))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('posts.show', $post))
        ->assertOk();
});

test('admin approve publishes a post and notifies the author', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $author = User::factory()->create();
    $follower = User::factory()->create();
    $follower->following()->attach($author->id);
    $post = Post::factory()->pending()->create([
        'user_id' => $author->id,
        'body' => 'Please approve me',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.posts.approve', $post))
        ->assertRedirect();

    expect($post->fresh()->moderation_status)->toBe(PostModerationStatus::Approved);

    Notification::assertSentTo($author, PostModeratedNotification::class);

    $this->actingAs($follower)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $post->id));
});

test('admin reject hides the post and shows the reason to the author', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $author = User::factory()->create();
    $stranger = User::factory()->create();
    $post = Post::factory()->pending()->create([
        'user_id' => $author->id,
        'body' => 'Not allowed',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.posts.reject', $post), [
            'reason' => 'Off-topic for this community.',
        ])
        ->assertRedirect();

    $post->refresh();

    expect($post->moderation_status)->toBe(PostModerationStatus::Rejected)
        ->and($post->moderation_reason)->toBe('Off-topic for this community.');

    Notification::assertSentTo($author, PostModeratedNotification::class);

    $this->actingAs($author)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.moderation_status', 'rejected')
            ->where('posts.data.0.moderation_reason', 'Off-topic for this community.'));

    $this->actingAs($stranger)
        ->get(route('posts.show', $post))
        ->assertForbidden();
});

test('admin created posts are auto-approved', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('posts.store'), [
            'body' => 'Admin announcement',
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('posts', [
        'user_id' => $admin->id,
        'body' => 'Admin announcement',
        'moderation_status' => PostModerationStatus::Approved->value,
    ]);
});

test('member edit of an approved or rejected post returns it to pending', function () {
    $author = User::factory()->create();
    $approved = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Was live',
    ]);
    $rejected = Post::factory()->rejected('Too short.')->create([
        'user_id' => $author->id,
        'body' => 'Was rejected',
    ]);

    $this->actingAs($author)
        ->patch(route('posts.update', $approved), [
            'body' => 'Edited live post',
        ])
        ->assertRedirect();

    $this->actingAs($author)
        ->patch(route('posts.update', $rejected), [
            'body' => 'Trying again after reject',
        ])
        ->assertRedirect();

    expect($approved->fresh()->moderation_status)->toBe(PostModerationStatus::Pending)
        ->and($rejected->fresh()->moderation_status)->toBe(PostModerationStatus::Pending)
        ->and($rejected->fresh()->moderation_reason)->toBeNull();
});

test('non admins cannot approve or reject posts', function () {
    $user = User::factory()->create();
    $post = Post::factory()->pending()->create();

    $this->actingAs($user)
        ->patch(route('admin.posts.approve', $post))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('admin.posts.reject', $post), [
            'reason' => 'Nope',
        ])
        ->assertForbidden();
});

test('members cannot like comment or share a pending post', function () {
    $author = User::factory()->create();
    $viewer = User::factory()->create();
    $post = Post::factory()->pending()->create(['user_id' => $author->id]);

    $this->actingAs($viewer)
        ->postJson(route('likes.store', $post))
        ->assertForbidden();

    $this->actingAs($viewer)
        ->post(route('comments.store', $post), [
            'body' => 'Hi',
        ])
        ->assertForbidden();

    $this->actingAs($viewer)
        ->post(route('posts.share', $post), [
            'body' => 'Sharing',
        ])
        ->assertForbidden();
});

test('pending posts are omitted from explore search and tags', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();
    $pending = Post::factory()->pending()->create([
        'user_id' => $author->id,
        'body' => 'UniquePendingToken #holdup',
        'created_at' => now()->subHour(),
    ]);
    app(HashtagService::class)->syncFor($pending, $pending->body);

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('posts.data', 0));

    $this->actingAs($viewer)
        ->get(route('search', ['q' => 'UniquePendingToken', 'tab' => 'posts']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('posts.data', 0));

    $this->actingAs($viewer)
        ->get(route('tags.show', 'holdup'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('posts.data', 0));
});

test('mentions notify when the post is approved not when submitted', function () {
    Notification::fake();

    $author = User::factory()->create();
    $mentioned = User::factory()->create(['username' => 'alice42']);
    $admin = User::factory()->admin()->create();

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Hello @alice42 how are you?',
        ])
        ->assertRedirect(route('feed'));

    $post = Post::query()->first();

    Notification::assertNotSentTo($mentioned, UserMentionedNotification::class);

    $this->actingAs($admin)
        ->patch(route('admin.posts.approve', $post))
        ->assertRedirect();

    Notification::assertSentTo($mentioned, UserMentionedNotification::class);
});

test('approving a previously reviewed post does not type-error on reviewed_at', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $author = User::factory()->create();
    $post = Post::factory()->rejected('Too short.')->create([
        'user_id' => $author->id,
        'body' => 'Resubmitted copy',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.posts.approve', $post))
        ->assertRedirect();

    expect($post->fresh()->moderation_status)->toBe(PostModerationStatus::Approved);
});

test('share to feed notifies the original author after approval', function () {
    Notification::fake();

    $author = User::factory()->create();
    $sharer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($sharer)
        ->post(route('posts.share', $post), [
            'body' => '',
        ])
        ->assertRedirect(route('feed'));

    $share = Post::query()->where('user_id', $sharer->id)->first();

    expect($share->moderation_status)->toBe(PostModerationStatus::Pending);
    Notification::assertNotSentTo($author, PostSharedNotification::class);

    $this->actingAs($admin)
        ->patch(route('admin.posts.approve', $share))
        ->assertRedirect();

    Notification::assertSentTo($author, PostSharedNotification::class);
});

test('author pending posts appear on own profile but not on visitors profile view', function () {
    $author = User::factory()->create(['username' => 'queued_user']);
    $visitor = User::factory()->create();
    $post = Post::factory()->pending()->create([
        'user_id' => $author->id,
        'body' => 'Only me for now',
    ]);

    $this->actingAs($author)
        ->get(route('profile.show', 'queued_user'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $post->id));

    $this->actingAs($visitor)
        ->get(route('profile.show', 'queued_user'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('posts.data', 0));
});

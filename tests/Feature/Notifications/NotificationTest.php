<?php

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Notifications\PostLikedNotification;
use App\Notifications\UserFollowedNotification;
use App\Support\NotificationPresenter;
use Illuminate\Support\Facades\Notification;

test('following another user creates a notification', function () {
    Notification::fake();

    $follower = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($follower)
        ->post(route('follow.store', $target->username))
        ->assertRedirect();

    Notification::assertSentTo($target, UserFollowedNotification::class);
});

test('users can list and mark notifications as read', function () {
    $author = User::factory()->create();
    $viewer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);
    $media = PostMedia::query()->create([
        'post_id' => $post->id,
        'path' => 'posts/test-thumb.jpg',
        'position' => 0,
        'status' => PostMedia::STATUS_READY,
    ]);
    $post->setRelation('media', collect([$media]));
    $expectedImage = NotificationPresenter::postImageUrl($post);

    $author->notify(new PostLikedNotification($viewer, $post));

    expect($author->unreadNotifications()->count())->toBe(1);

    $this->actingAs($author)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 1)
            // Visiting the index marks all as read (badge clears).
            ->where('auth.unread_notifications_count', 0)
            // Presented row still reflects pre-mark unread for “New” styling.
            ->where('notifications.data.0.read_at', null)
            ->where('notifications.data.0.data.actor_name', $viewer->name)
            ->where('notifications.data.0.data.body', 'liked your post')
            ->where('notifications.data.0.data.actor_avatar', $viewer->avatarUrl() ?? '')
            ->where('notifications.data.0.data.post_image', $expectedImage)
            ->where('recent_notifications.0.data.body', 'liked your post')
            ->where('recent_notifications.0.data.actor_avatar', $viewer->avatarUrl() ?? '')
            ->where('recent_notifications.0.data.post_image', $expectedImage)
        );

    expect($author->fresh()->unreadNotifications()->count())->toBe(0);

    $this->actingAs($author)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('auth.unread_notifications_count', 0)
        );
});

test('mark all notifications as read', function () {
    $author = User::factory()->create();
    $viewer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $author->notify(new PostLikedNotification($viewer, $post));
    $author->notify(new UserFollowedNotification($viewer));

    $this->actingAs($author)
        ->patch(route('notifications.read-all'))
        ->assertRedirect();

    expect($author->fresh()->unreadNotifications()->count())->toBe(0);
});

<?php

use App\Enums\ReactionType;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostLikedNotification;
use Illuminate\Support\Facades\Notification;

test('users can like and unlike a post', function () {
    Notification::fake();

    $author = User::factory()->create();
    $viewer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($viewer)
        ->postJson(route('likes.store', $post))
        ->assertOk()
        ->assertJson([
            'liked' => true,
            'viewer_reaction' => 'like',
            'likes_count' => 1,
            'reaction_counts' => [
                'like' => 1,
                'love' => 0,
                'haha' => 0,
                'sad' => 0,
                'celebrate' => 0,
                'support' => 0,
                'insightful' => 0,
            ],
        ]);

    $this->assertDatabaseHas('likes', [
        'user_id' => $viewer->id,
        'post_id' => $post->id,
        'type' => 'like',
    ]);

    Notification::assertSentTo($author, PostLikedNotification::class);

    $this->actingAs($viewer)
        ->deleteJson(route('likes.destroy', $post))
        ->assertOk()
        ->assertJson([
            'liked' => false,
            'viewer_reaction' => null,
            'likes_count' => 0,
        ]);

    $this->assertDatabaseMissing('likes', [
        'user_id' => $viewer->id,
        'post_id' => $post->id,
    ]);
});

test('users can change reaction type without duplicate rows or re-notify', function () {
    Notification::fake();

    $author = User::factory()->create();
    $viewer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($viewer)
        ->postJson(route('likes.store', $post), ['type' => 'love'])
        ->assertOk()
        ->assertJson([
            'viewer_reaction' => 'love',
            'likes_count' => 1,
        ]);

    Notification::assertSentTo($author, function (PostLikedNotification $notification) {
        return $notification->reaction === ReactionType::Love;
    });

    Notification::fake();

    $this->actingAs($viewer)
        ->postJson(route('likes.store', $post), ['type' => 'celebrate'])
        ->assertOk()
        ->assertJson([
            'viewer_reaction' => 'celebrate',
            'likes_count' => 1,
            'reaction_counts' => [
                'like' => 0,
                'love' => 0,
                'haha' => 0,
                'sad' => 0,
                'celebrate' => 1,
                'support' => 0,
                'insightful' => 0,
            ],
        ]);

    expect(Like::query()->where('post_id', $post->id)->count())->toBe(1);
    expect(Like::query()->where('post_id', $post->id)->first()?->type)->toBe(ReactionType::Celebrate);
    Notification::assertNothingSent();
});

test('like pairs are unique and liking own post does not notify', function () {
    Notification::fake();

    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->postJson(route('likes.store', $post))->assertOk();
    $this->actingAs($user)->postJson(route('likes.store', $post))->assertOk();

    expect(Like::query()->where('post_id', $post->id)->count())->toBe(1);
    Notification::assertNothingSent();
});

test('invalid reaction type is rejected', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)
        ->postJson(route('likes.store', $post), ['type' => 'angry'])
        ->assertUnprocessable();
});

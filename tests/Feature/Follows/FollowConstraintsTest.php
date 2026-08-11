<?php

use App\Models\Follow;
use App\Models\Post;
use App\Models\User;

test('users can follow and unfollow another user', function () {
    $follower = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($follower)
        ->post(route('follow.store', $target->username))
        ->assertRedirect();

    $this->assertDatabaseHas('follows', [
        'follower_id' => $follower->id,
        'following_id' => $target->id,
    ]);

    $this->actingAs($follower)
        ->delete(route('follow.destroy', $target->username))
        ->assertRedirect();

    $this->assertDatabaseMissing('follows', [
        'follower_id' => $follower->id,
        'following_id' => $target->id,
    ]);
});

test('explore post payload includes author follow state', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();
    $post = Post::factory()->for($author)->create();

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $post->id)
            ->where('posts.data.0.user.can_follow', true)
            ->where('posts.data.0.user.followed_by_viewer', false));

    $viewer->following()->attach($author->id);

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('posts.data.0.user.followed_by_viewer', true));
});

test('users cannot follow themselves', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('follow.store', $user->username))
        ->assertForbidden();
});

test('follow pairs are unique', function () {
    $follower = User::factory()->create();
    $target = User::factory()->create();

    Follow::query()->create([
        'follower_id' => $follower->id,
        'following_id' => $target->id,
    ]);

    $this->actingAs($follower)
        ->post(route('follow.store', $target->username))
        ->assertRedirect();

    expect(
        Follow::query()
            ->where('follower_id', $follower->id)
            ->where('following_id', $target->id)
            ->count()
    )->toBe(1);
});

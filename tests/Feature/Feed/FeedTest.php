<?php

use App\Models\Post;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('feed'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the feed', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('feed'));

    $response->assertOk();
});

test('dashboard redirects to the feed', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertRedirect('/feed');
});

test('feed includes own posts and followed users posts only', function () {
    $viewer = User::factory()->create();
    $followed = User::factory()->create();
    $stranger = User::factory()->create();

    $viewer->following()->attach($followed->id);

    $own = Post::factory()->create(['user_id' => $viewer->id, 'body' => 'Own post']);
    $followedPost = Post::factory()->create(['user_id' => $followed->id, 'body' => 'Followed post']);
    Post::factory()->create(['user_id' => $stranger->id, 'body' => 'Stranger post']);

    $this->actingAs($viewer)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('feed/index')
            ->has('posts.data', 2)
            ->where('posts.data.0.body', fn ($body) => in_array($body, ['Own post', 'Followed post'], true))
        );

    expect(Post::query()->whereKey($own->id)->exists())->toBeTrue();
    expect(Post::query()->whereKey($followedPost->id)->exists())->toBeTrue();
});

test('feed cursor-paginates fifteen posts per page', function () {
    $viewer = User::factory()->create();

    Post::factory()->count(16)->create(['user_id' => $viewer->id]);

    $first = $this->actingAs($viewer)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('feed/index')
            ->has('posts.data', 15)
            ->where('posts.next_cursor', fn ($cursor) => is_string($cursor) && $cursor !== '')
        );

    $nextCursor = $first->original->getData()['page']['props']['posts']['next_cursor'];

    $this->actingAs($viewer)
        ->get(route('feed', ['cursor' => $nextCursor]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('feed/index')
            ->has('posts.data', 1)
            ->where('posts.next_cursor', null)
        );
});

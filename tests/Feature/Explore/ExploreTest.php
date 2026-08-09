<?php

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;

test('explore ranks recent posts by engagement score', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();

    $low = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Low score',
        'created_at' => now()->subHour(),
    ]);
    $high = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'High score',
        'created_at' => now()->subMinutes(30),
    ]);
    Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Too old',
        'created_at' => now()->subHours(50),
    ]);

    Like::query()->create(['user_id' => $viewer->id, 'post_id' => $high->id]);
    Like::query()->create(['user_id' => $author->id, 'post_id' => $high->id]);
    Comment::query()->create([
        'user_id' => $viewer->id,
        'post_id' => $high->id,
        'body' => 'Nice',
    ]);

    Like::query()->create(['user_id' => $viewer->id, 'post_id' => $low->id]);

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->has('posts.data', 2)
            ->where('posts.data.0.id', $high->id)
            ->where('posts.data.1.id', $low->id));
});

test('explore paginates fifteen posts per page', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();

    Post::factory()->count(16)->create([
        'user_id' => $author->id,
        'created_at' => now()->subHour(),
    ]);

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->has('posts.data', 15)
            ->where('posts.next_page_url', fn ($url) => is_string($url) && str_contains($url, 'page=2'))
        );

    $this->actingAs($viewer)
        ->get(route('explore', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->has('posts.data', 1)
            ->where('posts.next_page_url', null)
        );
});

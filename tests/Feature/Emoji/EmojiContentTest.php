<?php

use App\Models\Post;
use App\Models\User;

test('users can create an emoji-only post', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), [
            'body' => '🙌',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'body' => '🙌',
    ]);
});

test('users can create an emoji-only comment', function () {
    $author = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($commenter)
        ->post(route('comments.store', $post), [
            'body' => '❤️',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'post_id' => $post->id,
        'user_id' => $commenter->id,
        'body' => '❤️',
    ]);
});

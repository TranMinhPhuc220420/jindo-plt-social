<?php

use App\Models\Post;
use App\Models\User;

test('users can create a post', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), [
            'body' => 'Hello world from the social feed',
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'body' => 'Hello world from the social feed',
    ]);
});

test('users cannot update another users post', function () {
    $author = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($other)
        ->patch(route('posts.update', $post), [
            'body' => 'Hacked',
        ])
        ->assertForbidden();

    expect($post->fresh()->body)->not->toBe('Hacked');
});

test('authors can delete their own posts', function () {
    $author = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($author)
        ->delete(route('posts.destroy', $post))
        ->assertRedirect();

    $this->assertSoftDeleted($post);
});

test('admins can delete any post', function () {
    $author = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($admin)
        ->delete(route('posts.destroy', $post))
        ->assertRedirect();

    $this->assertSoftDeleted($post);
});

<?php

use App\Models\Bookmark;
use App\Models\Post;
use App\Models\User;

test('users can bookmark and unbookmark a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($user)
        ->postJson(route('bookmarks.store', $post))
        ->assertOk()
        ->assertJson(['bookmarked' => true, 'bookmarks_count' => 1]);

    $this->assertDatabaseHas('bookmarks', [
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);

    $this->actingAs($user)
        ->deleteJson(route('bookmarks.destroy', $post))
        ->assertOk()
        ->assertJson(['bookmarked' => false, 'bookmarks_count' => 0]);

    $this->assertDatabaseMissing('bookmarks', [
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);
});

test('bookmark list shows only the viewers saved posts', function () {
    $viewer = User::factory()->create();
    $other = User::factory()->create();
    $saved = Post::factory()->create();
    $notSaved = Post::factory()->create();

    Bookmark::query()->create([
        'user_id' => $viewer->id,
        'post_id' => $saved->id,
    ]);
    Bookmark::query()->create([
        'user_id' => $other->id,
        'post_id' => $notSaved->id,
    ]);

    $this->actingAs($viewer)
        ->get(route('bookmarks.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('bookmarks/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $saved->id)
            ->where('posts.data.0.bookmarked_by_viewer', true)
            ->where('posts.data.0.bookmarks_count', 1));
});

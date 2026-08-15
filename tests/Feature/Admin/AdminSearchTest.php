<?php

use App\Models\Post;
use App\Models\User;

test('admins can search users by username', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['username' => 'needle_user', 'name' => 'Needle']);
    User::factory()->create(['username' => 'other_person']);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['q' => 'needle']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.username', 'needle_user')
            ->where('filters.q', 'needle'));
});

test('admins can search posts by body', function () {
    $admin = User::factory()->admin()->create();
    Post::factory()->create(['body' => 'unique body xyz']);
    Post::factory()->create(['body' => 'something else']);

    $this->actingAs($admin)
        ->get(route('admin.posts.index', ['q' => 'xyz', 'status' => 'all']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/posts/index')
            ->has('posts.data', 1)
            ->where('filters.q', 'xyz'));
});

test('admins can search posts by author username', function () {
    $admin = User::factory()->admin()->create();
    $author = User::factory()->create(['username' => 'author_hit']);
    Post::factory()->for($author)->create(['body' => 'hello there']);
    Post::factory()->create(['body' => 'unrelated']);

    $this->actingAs($admin)
        ->get(route('admin.posts.index', ['q' => 'author_hit', 'status' => 'all']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/posts/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.user.username', 'author_hit'));
});

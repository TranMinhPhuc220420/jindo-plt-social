<?php

use App\Models\Post;
use App\Models\User;

test('admins can list users and suspend them', function () {
    $admin = User::factory()->admin()->create();
    $member = User::factory()->create(['username' => 'member']);

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $member), [
            'suspended' => true,
        ])
        ->assertRedirect();

    expect($member->fresh()->isSuspended())->toBeTrue();
});

test('non admins cannot access admin pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('admins can delete posts from the admin panel', function () {
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.posts.destroy', $post))
        ->assertRedirect();

    $this->assertSoftDeleted($post);
});

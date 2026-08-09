<?php

use App\Models\User;

test('admins can view the analytics dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('metrics.users_total')
            ->has('metrics.posts_7d'));
});

test('non admins cannot view the admin dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can view failed jobs page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.failed-jobs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/failed-jobs/index'));
});

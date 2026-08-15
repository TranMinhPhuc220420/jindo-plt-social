<?php

use App\Enums\PostModerationStatus;
use App\Models\AdminAuditLog;
use App\Models\Post;
use App\Models\User;

test('admin posts index defaults to pending and includes review payload', function () {
    $admin = User::factory()->admin()->create();
    $pending = Post::factory()->pending()->create(['body' => 'Needs a look']);
    Post::factory()->create(['body' => 'Already live']);

    $this->actingAs($admin)
        ->get(route('admin.posts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/posts/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $pending->id)
            ->where('posts.data.0.body', 'Needs a look')
            ->where('posts.data.0.moderation_status', 'pending')
            ->has('posts.data.0.user.avatar')
            ->has('posts.data.0.media')
            ->where('filters.status', 'pending'));
});

test('admins can filter posts by status and search query', function () {
    $admin = User::factory()->admin()->create();
    $author = User::factory()->create(['username' => 'author_hit']);
    Post::factory()->for($author)->pending()->create(['body' => 'hello there']);
    Post::factory()->create(['body' => 'unique body xyz']);

    $this->actingAs($admin)
        ->get(route('admin.posts.index', ['status' => 'all', 'q' => 'xyz']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('filters.q', 'xyz')
            ->where('filters.status', 'all'));

    $this->actingAs($admin)
        ->get(route('admin.posts.index', ['status' => 'all', 'q' => 'author_hit']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.user.username', 'author_hit'));
});

test('rejecting a post requires a reason and writes an audit log', function () {
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->pending()->create();

    $this->actingAs($admin)
        ->patch(route('admin.posts.reject', $post), [])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin)
        ->patch(route('admin.posts.reject', $post), [
            'reason' => 'Spam.',
        ])
        ->assertRedirect();

    expect(AdminAuditLog::query()->where('action', 'post.rejected')->exists())->toBeTrue()
        ->and($post->fresh()->moderation_status)->toBe(PostModerationStatus::Rejected);
});

test('approving a post writes an audit log', function () {
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->pending()->create();

    $this->actingAs($admin)
        ->patch(route('admin.posts.approve', $post))
        ->assertRedirect();

    expect(AdminAuditLog::query()->where('action', 'post.approved')->exists())->toBeTrue();
});

test('admin dashboard includes pending post count', function () {
    $admin = User::factory()->admin()->create();
    Post::factory()->pending()->create();
    Post::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.posts_pending', 1)
            ->where('metrics.posts_total', 2));
});

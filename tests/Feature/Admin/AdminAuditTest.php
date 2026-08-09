<?php

use App\Models\AdminAuditLog;
use App\Models\Post;
use App\Models\User;

test('suspending a user writes an admin audit log', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $user), [
            'suspended' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('admin_audit_logs', [
        'actor_id' => $admin->id,
        'action' => 'user.suspended',
        'subject_type' => User::class,
        'subject_id' => $user->id,
    ]);
});

test('admin deleting a post writes an admin audit log', function () {
    $admin = User::factory()->admin()->create();
    $post = Post::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.posts.destroy', $post))
        ->assertRedirect();

    expect(AdminAuditLog::query()->where('action', 'post.deleted')->exists())->toBeTrue();
});

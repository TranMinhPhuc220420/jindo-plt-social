<?php

use App\Enums\UserRole;
use App\Models\AdminAuditLog;
use App\Models\User;

test('admins can create a verified user who can log in', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Member',
            'username' => 'new_member',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'birthday' => '1990-01-15',
        ])
        ->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    $created = User::query()->where('email', 'new@example.com')->firstOrFail();

    expect($created->username)->toBe('new_member')
        ->and($created->role)->toBe(UserRole::User)
        ->and($created->hasVerifiedEmail())->toBeTrue()
        ->and($created->birthday?->format('Y-m-d'))->toBe('1990-01-15');

    $this->assertDatabaseHas('admin_audit_logs', [
        'actor_id' => $admin->id,
        'action' => 'user.created',
        'subject_type' => User::class,
        'subject_id' => $created->id,
    ]);

    $log = AdminAuditLog::query()->where('action', 'user.created')->firstOrFail();

    expect($log->meta)->not->toHaveKey('password');

    $this->post(route('logout'));

    $this->post(route('login.store'), [
        'email' => 'new@example.com',
        'password' => 'password',
    ])->assertRedirect(route('feed', absolute: false));

    $this->assertAuthenticatedAs($created);
});

test('non admins cannot create users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.users.store'), [
            'name' => 'New Member',
            'username' => 'new_member',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', [
        'email' => 'new@example.com',
    ]);
});

test('creating a user requires a valid username', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->post(route('admin.users.store'), [
            'name' => 'New Member',
            'username' => 'Bad Name!',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'birthday' => '1990-01-15',
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('username');

    $this->assertDatabaseMissing('users', [
        'email' => 'new@example.com',
    ]);
});

test('guests cannot create users', function () {
    $this->post(route('admin.users.store'), [
        'name' => 'New Member',
        'username' => 'new_member',
        'email' => 'new@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('login'));
});

test('creating a user under 16 requires guardian consent', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->post(route('admin.users.store'), [
            'name' => 'Young Learner',
            'username' => 'young_learner',
            'email' => 'young@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'birthday' => now()->subYears(12)->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHasErrors(['guardian_name', 'guardian_email', 'guardian_relationship', 'guardian_consented']);
});

test('admins can create a user under 16 with guardian details', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Young Learner',
            'username' => 'young_learner',
            'email' => 'young@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'birthday' => now()->subYears(12)->toDateString(),
            'guardian_name' => 'Parent Name',
            'guardian_email' => 'parent@example.com',
            'guardian_relationship' => 'Parent',
            'guardian_consented' => '1',
            'child_consented' => '1',
        ])
        ->assertRedirect();

    $created = User::query()->where('email', 'young@example.com')->firstOrFail();

    expect($created->isChild())->toBeTrue()
        ->and($created->guardian_name)->toBe('Parent Name')
        ->and($created->guardian_consented_at)->not->toBeNull()
        ->and($created->child_consented_at)->not->toBeNull();
});

test('creating a 16-17 year old requires attestation', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->post(route('admin.users.store'), [
            'name' => 'Teen Learner',
            'username' => 'teen_learner',
            'email' => 'teen@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'birthday' => now()->subYears(17)->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('under18_attested');
});

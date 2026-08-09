<?php

use App\Models\User;
use App\Support\MediaDisk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => 'test@example.com',
            'bio' => 'Hello bio',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->username)->toBe('test_user');
    expect($user->email)->toBe('test@example.com');
    expect($user->bio)->toBe('Hello bio');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'username' => $user->username,
            'email' => $user->email,
            'bio' => $user->bio,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can upload avatar from profile media endpoint', function () {
    Storage::fake(MediaDisk::name());
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('profile.show', $user->username))
        ->post(route('profile.media'), [
            'avatar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.show', $user->username));

    $user->refresh();

    expect($user->avatar_path)->not->toBeNull();
    Storage::disk(MediaDisk::name())->assertExists($user->avatar_path);
});

test('user can upload cover from profile media endpoint', function () {
    Storage::fake(MediaDisk::name());
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('profile.show', $user->username))
        ->post(route('profile.media'), [
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 300),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.show', $user->username));

    $user->refresh();

    expect($user->cover_path)->not->toBeNull();
    Storage::disk(MediaDisk::name())->assertExists($user->cover_path);
});

test('media upload requires a file', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('profile.show', $user->username))
        ->post(route('profile.media'), [])
        ->assertSessionHasErrors('avatar');
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

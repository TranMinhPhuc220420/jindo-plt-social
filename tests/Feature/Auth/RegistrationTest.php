<?php

use App\Enums\UserRole;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen shows a closed message by default', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/register-closed'));
});

test('public registration is forbidden', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'test_user',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertForbidden();

    $this->assertGuest();
    $this->assertDatabaseMissing('users', [
        'email' => 'test@example.com',
    ]);
});

test('new users can register when public registration is enabled', function () {
    config(['fortify.public_registration' => true]);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'test_user',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('feed', absolute: false));
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'username' => 'test_user',
        'role' => UserRole::User->value,
    ]);
});

test('registration requires a valid username when public registration is enabled', function () {
    config(['fortify.public_registration' => true]);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'Bad Name!',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('username');
    $this->assertGuest();
});

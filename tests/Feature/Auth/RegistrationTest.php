<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register with a unique username', function () {
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
    ]);
});

test('registration requires a valid username', function () {
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

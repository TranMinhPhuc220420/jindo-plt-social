<?php

use App\Models\User;

test('guests cannot search users', function () {
    $this->get(route('search', ['q' => 'alice']))
        ->assertRedirect(route('login'));
});

test('authenticated users can search by username prefix', function () {
    $viewer = User::factory()->create(['username' => 'viewer1', 'name' => 'Viewer One']);
    User::factory()->create(['username' => 'alice42', 'name' => 'Alice']);
    User::factory()->create(['username' => 'bob99', 'name' => 'Bob']);

    $this->actingAs($viewer)
        ->get(route('search', ['q' => 'ali']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/index')
            ->where('query', 'ali')
            ->has('users', 1)
            ->where('users.0.username', 'alice42'));
});

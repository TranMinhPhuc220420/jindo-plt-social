<?php

use App\Models\User;

test('authenticated pages share the realtime driver from broadcasting config', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('realtime.driver', null));

    config(['broadcasting.default' => 'firebase']);

    $this->actingAs($user)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('realtime.driver', 'firebase'));
});

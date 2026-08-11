<?php

use App\Models\User;
use App\Services\Firebase\FirebaseClient;

test('firebase token endpoint returns 503 when firebase is not configured', function () {
    $this->mock(FirebaseClient::class, function ($mock) {
        $mock->shouldReceive('enabled')->andReturn(false);
    });

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('firebase.token'))
        ->assertStatus(503)
        ->assertJson(['message' => 'Firebase is not configured.']);
});

test('firebase token endpoint requires authentication', function () {
    $this->postJson(route('firebase.token'))
        ->assertUnauthorized();
});

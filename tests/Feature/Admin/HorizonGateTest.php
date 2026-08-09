<?php

use App\Models\User;
use Illuminate\Support\Facades\Gate;

test('horizon gate allows admins only', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    expect(Gate::forUser($admin)->allows('viewHorizon'))->toBeTrue()
        ->and(Gate::forUser($user)->allows('viewHorizon'))->toBeFalse();
});

test('non admins cannot view horizon dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/horizon')
        ->assertForbidden();
});

test('admins can view horizon dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/horizon')
        ->assertOk();
});

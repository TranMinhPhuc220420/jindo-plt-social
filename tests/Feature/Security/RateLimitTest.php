<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

test('post creation is rate limited', function () {
    $user = User::factory()->create();
    RateLimiter::clear('posts:'.$user->id);

    $this->actingAs($user);

    foreach (range(1, 10) as $i) {
        $this->post(route('posts.store'), [
            'body' => "Post number {$i}",
        ])->assertRedirect(route('feed'));
    }

    $this->post(route('posts.store'), [
        'body' => 'One too many',
    ])->assertStatus(429);
});

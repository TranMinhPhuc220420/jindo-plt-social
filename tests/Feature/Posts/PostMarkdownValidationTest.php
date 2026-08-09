<?php

use App\Models\User;

test('users can create a post with allowed markdown', function () {
    $user = User::factory()->create();

    $body = "**bold** and *italic*\n\n- list item\n\n[docs](https://example.com)";

    $this->actingAs($user)
        ->post(route('posts.store'), [
            'body' => $body,
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'body' => $body,
    ]);
});

test('post body rejects raw html', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('feed'))
        ->post(route('posts.store'), [
            'body' => 'Hello <script>alert(1)</script>',
        ])
        ->assertRedirect(route('feed'))
        ->assertSessionHasErrors('body');
});

test('post body rejects markdown images', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('feed'))
        ->post(route('posts.store'), [
            'body' => 'Look ![x](https://example.com/a.png)',
        ])
        ->assertRedirect(route('feed'))
        ->assertSessionHasErrors('body');
});

test('post body rejects markdown headings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('feed'))
        ->post(route('posts.store'), [
            'body' => "# Heading\n\nNormal text",
        ])
        ->assertRedirect(route('feed'))
        ->assertSessionHasErrors('body');
});

test('post body rejects javascript links', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('feed'))
        ->post(route('posts.store'), [
            'body' => 'Click [x](javascript:alert(1))',
        ])
        ->assertRedirect(route('feed'))
        ->assertSessionHasErrors('body');
});

test('hashtag without space after hash is allowed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('posts.store'), [
            'body' => 'Talking about #laravel today',
        ])
        ->assertRedirect(route('feed'));

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'body' => 'Talking about #laravel today',
    ]);
});

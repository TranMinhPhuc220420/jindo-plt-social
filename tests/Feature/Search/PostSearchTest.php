<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('guests cannot search posts', function () {
    $this->get(route('search', ['q' => 'hello', 'tab' => 'posts']))
        ->assertRedirect(route('login'));
});

test('authenticated users can search posts by body', function () {
    $viewer = User::factory()->create();
    $match = Post::factory()->create(['body' => 'UniqueZebraPhrase in the wild']);
    Post::factory()->create(['body' => 'Nothing relevant here']);

    $this->actingAs($viewer)
        ->get(route('search', ['q' => 'UniqueZebraPhrase', 'tab' => 'posts']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/index')
            ->where('tab', 'posts')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $match->id));
});

test('empty post search returns no results', function () {
    $viewer = User::factory()->create();
    Post::factory()->create();

    $this->actingAs($viewer)
        ->get(route('search', ['q' => '', 'tab' => 'posts']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tab', 'posts')
            ->has('posts.data', 0));
});

test('post search uses like fallback on non-mysql drivers', function () {
    $driver = Schema::getConnection()->getDriverName();

    expect(in_array($driver, ['mysql', 'mariadb'], true))->toBeFalse();

    $viewer = User::factory()->create();
    $match = Post::factory()->create(['body' => 'PortableSearchToken xyz']);

    $this->actingAs($viewer)
        ->get(route('search', ['q' => 'PortableSearchToken', 'tab' => 'posts']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $match->id));
});

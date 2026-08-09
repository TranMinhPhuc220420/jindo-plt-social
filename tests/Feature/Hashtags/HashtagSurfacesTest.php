<?php

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\HashtagService;

test('tag page lists posts with that tag', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();
    $tagged = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Hello #laravel',
    ]);
    Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'No tags here',
    ]);

    app(HashtagService::class)->syncFor($tagged, $tagged->body);

    $this->actingAs($viewer)
        ->get(route('tags.show', 'laravel'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tags/show')
            ->where('tag.slug', 'laravel')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $tagged->id));
});

test('missing tag slug returns 404', function () {
    $viewer = User::factory()->create();

    $this->actingAs($viewer)
        ->get(route('tags.show', 'missingtag'))
        ->assertNotFound();
});

test('explore includes trending tags from the last seven days', function () {
    $viewer = User::factory()->create();
    $author = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id, 'body' => '#hot']);
    app(HashtagService::class)->syncFor($post, $post->body);

    $this->actingAs($viewer)
        ->get(route('explore'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->has('trending_tags', 1)
            ->where('trending_tags.0.slug', 'hot'));
});

test('search tab tags matches slug prefix', function () {
    $viewer = User::factory()->create();
    Tag::query()->create(['name' => 'laravel', 'slug' => 'laravel']);
    Tag::query()->create(['name' => 'php', 'slug' => 'php']);

    $this->actingAs($viewer)
        ->get(route('search', ['q' => 'lar', 'tab' => 'tags']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/index')
            ->where('tab', 'tags')
            ->has('tags', 1)
            ->where('tags.0.slug', 'laravel'));
});

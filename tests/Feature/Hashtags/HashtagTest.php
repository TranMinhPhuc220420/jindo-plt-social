<?php

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\HashtagService;

test('extractSlugs normalizes lowercase and caps at five unique tags', function () {
    $service = app(HashtagService::class);

    $slugs = $service->extractSlugs(
        'Hello #Laravel #PHP #Laravel #Vue #React #Inertia #TooMany'
    );

    expect($slugs)->toBe(['laravel', 'php', 'vue', 'react', 'inertia']);
});

test('extractSlugs ignores invalid hashtags', function () {
    $service = app(HashtagService::class);

    // `#a` too short; hyphen ends the token so `#has-htag` yields `has`
    expect($service->extractSlugs('bad #a #has-htag #ok_tag!'))->toBe(['has', 'ok_tag']);
});

test('creating a post syncs hashtags to tags and post_tag', function () {
    $author = User::factory()->create();

    $this->actingAs($author)
        ->post(route('posts.store'), [
            'body' => 'Shipping #Laravel and #Pest today',
        ])
        ->assertRedirect(route('feed'));

    $post = Post::query()->first();

    expect($post->tags()->pluck('slug')->sort()->values()->all())
        ->toBe(['laravel', 'pest']);

    $this->assertDatabaseHas('tags', ['slug' => 'laravel']);
    $this->assertDatabaseHas('tags', ['slug' => 'pest']);
});

test('updating a post re-syncs hashtags and removes stale ones', function () {
    $author = User::factory()->create();
    $post = Post::factory()->create([
        'user_id' => $author->id,
        'body' => 'Old #alpha #beta',
    ]);

    app(HashtagService::class)->syncFor($post, $post->body);

    expect($post->fresh()->tags()->pluck('slug')->sort()->values()->all())
        ->toBe(['alpha', 'beta']);

    $this->actingAs($author)
        ->patch(route('posts.update', $post), [
            'body' => 'Now only #gamma',
        ])
        ->assertRedirect();

    expect($post->fresh()->tags()->pluck('slug')->all())->toBe(['gamma']);
    expect(Tag::query()->where('slug', 'alpha')->exists())->toBeTrue();
});

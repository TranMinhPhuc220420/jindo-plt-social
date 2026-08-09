<?php

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Services\ConversationService;
use App\Support\MediaDisk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('shared unread messages count reflects unread inbound messages', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $conversation = app(ConversationService::class)->findOrCreateBetween($a, $b);

    $conversation->messages()->create([
        'user_id' => $a->id,
        'body' => 'Hello B',
    ]);

    $this->actingAs($b)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('auth.unread_messages_count', 1));

    $this->actingAs($b)
        ->get(route('messages.show', $conversation))
        ->assertOk();

    $this->actingAs($b)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('auth.unread_messages_count', 0));
});

test('authors can remove media when updating a post', function () {
    Storage::fake(MediaDisk::name());

    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $path = UploadedFile::fake()->image('keep.jpg')->store('posts', MediaDisk::name());
    $media = PostMedia::query()->create([
        'post_id' => $post->id,
        'path' => $path,
        'position' => 0,
        'status' => PostMedia::STATUS_READY,
    ]);

    $this->actingAs($user)
        ->patch(route('posts.update', $post), [
            'body' => 'Updated without image',
            'remove_media_ids' => [$media->id],
        ])
        ->assertRedirect();

    expect($post->fresh()->media()->count())->toBe(0);
    MediaDisk::disk()->assertMissing($path);
});

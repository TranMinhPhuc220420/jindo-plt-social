<?php

use App\Jobs\ProcessPostMediaJob;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Support\MediaDisk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

test('posts accept up to six images and dispatch processing jobs', function () {
    Storage::fake(MediaDisk::name());
    Queue::fake();

    $user = User::factory()->create();

    $images = collect(range(1, 6))
        ->map(fn (int $i) => UploadedFile::fake()->image("photo-{$i}.jpg", 200, 200))
        ->all();

    $this->actingAs($user)
        ->post(route('posts.store'), [
            'body' => 'Multi image post',
            'images' => $images,
        ])
        ->assertRedirect(route('feed'));

    $post = Post::query()->where('user_id', $user->id)->first();

    expect($post)->not->toBeNull()
        ->and($post->media()->count())->toBe(6);

    Queue::assertPushed(ProcessPostMediaJob::class, 6);
});

test('posts reject more than six images', function () {
    Storage::fake(MediaDisk::name());

    $user = User::factory()->create();

    $images = collect(range(1, 7))
        ->map(fn (int $i) => UploadedFile::fake()->image("photo-{$i}.jpg"))
        ->all();

    $this->actingAs($user)
        ->from(route('feed'))
        ->post(route('posts.store'), [
            'body' => 'Too many images',
            'images' => $images,
        ])
        ->assertRedirect(route('feed'))
        ->assertSessionHasErrors('images');
});

test('process post media job marks media ready', function () {
    Storage::fake(MediaDisk::name());

    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $file = UploadedFile::fake()->image('raw.jpg', 1800, 1200);
    $path = $file->store('posts', MediaDisk::name());

    $media = PostMedia::query()->create([
        'post_id' => $post->id,
        'path' => $path,
        'position' => 0,
        'status' => PostMedia::STATUS_PENDING,
    ]);

    (new ProcessPostMediaJob($media->id))->handle();

    $media->refresh();

    expect($media->status)->toBe(PostMedia::STATUS_READY)
        ->and($media->width)->toBeLessThanOrEqual(1600)
        ->and($media->height)->toBeLessThanOrEqual(1600)
        ->and(MediaDisk::disk()->exists($media->path))->toBeTrue();
});

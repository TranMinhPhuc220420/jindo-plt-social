<?php

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Support\MediaDisk;
use Database\Seeders\DemoSocialSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

test('demo seeder creates vietnamese learning posts with processed images', function () {
    Storage::fake(MediaDisk::name());
    Notification::fake();
    Http::preventStrayRequests();

    $file = UploadedFile::fake()->image('seed.jpg', 80, 60);
    $jpeg = file_get_contents($file->getRealPath());

    expect($jpeg)->toBeString()->not->toBe('');

    Http::fake([
        '*' => Http::response($jpeg, 200, ['Content-Type' => 'image/jpeg']),
    ]);

    $this->seed(DemoSocialSeeder::class);

    expect(User::query()->where('email', 'alice@example.com')->exists())->toBeFalse()
        ->and(User::query()->where('email', 'test@example.com')->value('name'))->toBe('Trần Minh Khoa')
        ->and(User::query()->where('email', 'admin@example.com')->value('name'))->toBe('Nguyễn Thị Lan')
        ->and(Post::query()->count())->toBeGreaterThanOrEqual(18)
        ->and(Post::query()->where('body', 'like', '%ChatGPT%')->exists())->toBeTrue()
        ->and(Post::query()->where('body', 'like', '%Gemini%')->exists())->toBeTrue()
        ->and(Post::query()->where('body', 'like', '%Claude%')->exists())->toBeTrue()
        ->and(Post::query()->where('body', 'like', '%Pest%')->exists())->toBeTrue()
        ->and(PostMedia::query()->where('status', PostMedia::STATUS_READY)->count())->toBeGreaterThan(0);
});

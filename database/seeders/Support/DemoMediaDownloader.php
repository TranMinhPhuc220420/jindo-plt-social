<?php

namespace Database\Seeders\Support;

use App\Jobs\ProcessPostMediaJob;
use App\Models\Post;
use App\Models\PostMedia;
use App\Support\MediaDisk;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

final class DemoMediaDownloader
{
    /**
     * @var array<string, string>
     */
    private array $binaries = [];

    /**
     * @param  array<string, array{url: string, source: string, attribution: string}>  $catalog
     */
    public function __construct(
        private readonly array $catalog,
        private readonly ?Command $command = null,
    ) {}

    public function attach(Post $post, string $key, int $position): void
    {
        $binary = $this->binaryFor($key);

        if ($binary === null || $binary === '') {
            return;
        }

        $path = 'posts/seed-'.Str::uuid()->toString().'.jpg';
        MediaDisk::disk()->put($path, $binary);

        $media = $post->media()->create([
            'path' => $path,
            'position' => $position,
            'status' => PostMedia::STATUS_PENDING,
        ]);

        (new ProcessPostMediaJob($media->id))->handle();
    }

    private function binaryFor(string $key): ?string
    {
        if (array_key_exists($key, $this->binaries)) {
            return $this->binaries[$key];
        }

        $spec = $this->catalog[$key] ?? null;

        if ($spec === null) {
            $this->warn("Unknown demo image key [{$key}].");
            $this->binaries[$key] = '';

            return null;
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'User-Agent' => 'PLTHocBaLocalSeeder/1.0 (learning-community demo seed)',
                    'Accept' => 'image/jpeg,image/png,image/webp,image/*',
                ])
                ->get($spec['url']);
        } catch (Throwable $exception) {
            $this->warn("Could not download [{$key}]: {$exception->getMessage()}");
            $this->binaries[$key] = '';

            return null;
        }

        if ($response->failed()) {
            $this->warn("Could not download [{$key}]: HTTP {$response->status()}.");
            $this->binaries[$key] = '';

            return null;
        }

        $body = $response->body();

        if ($body === '') {
            $this->warn("Empty body for demo image [{$key}].");
            $this->binaries[$key] = '';

            return null;
        }

        $this->binaries[$key] = $body;

        return $body;
    }

    private function warn(string $message): void
    {
        $this->command?->warn($message);
    }
}

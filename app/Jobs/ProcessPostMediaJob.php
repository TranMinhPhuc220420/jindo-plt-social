<?php

namespace App\Jobs;

use App\Models\PostMedia;
use App\Support\MediaDisk;
use App\Support\StructuredLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessPostMediaJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $postMediaId) {}

    public function handle(): void
    {
        $media = PostMedia::query()->find($this->postMediaId);

        if ($media === null) {
            return;
        }

        $disk = MediaDisk::disk();

        if (! $disk->exists($media->path) || ! function_exists('imagecreatefromstring')) {
            $media->update(['status' => PostMedia::STATUS_FAILED]);

            return;
        }

        $binary = $disk->get($media->path);

        if ($binary === null || $binary === '') {
            $media->update(['status' => PostMedia::STATUS_FAILED]);

            return;
        }

        $source = @imagecreatefromstring($binary);

        if ($source === false) {
            $media->update(['status' => PostMedia::STATUS_FAILED]);

            return;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $maxEdge = 1600;
        $scale = min(1, $maxEdge / max($width, $height));
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        imagejpeg($resized, null, 82);
        $encoded = ob_get_clean();

        imagedestroy($source);
        imagedestroy($resized);

        if ($encoded === false) {
            $media->update(['status' => PostMedia::STATUS_FAILED]);

            return;
        }

        $newPath = preg_replace('/\.[^.]+$/', '.jpg', $media->path) ?: $media->path;
        $disk->put($newPath, $encoded);

        if ($newPath !== $media->path) {
            $disk->delete($media->path);
        }

        $media->update([
            'path' => $newPath,
            'status' => PostMedia::STATUS_READY,
            'width' => $newWidth,
            'height' => $newHeight,
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        PostMedia::query()->whereKey($this->postMediaId)->update([
            'status' => PostMedia::STATUS_FAILED,
        ]);

        StructuredLog::warning('ProcessPostMediaJob failed', [
            'post_media_id' => $this->postMediaId,
            'message' => $exception?->getMessage(),
            'exception_class' => $exception !== null ? $exception::class : null,
        ]);
    }
}

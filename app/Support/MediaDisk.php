<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class MediaDisk
{
    public static function name(): string
    {
        return (string) config('filesystems.media', 'public');
    }

    public static function disk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(self::name());

        return $disk;
    }
}

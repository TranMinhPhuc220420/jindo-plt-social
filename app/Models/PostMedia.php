<?php

namespace App\Models;

use App\Support\MediaDisk;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $post_id
 * @property string $path
 * @property int $position
 * @property string $status
 * @property int|null $width
 * @property int|null $height
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['post_id', 'path', 'position', 'status', 'width', 'height'])]
class PostMedia extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_READY = 'ready';

    public const STATUS_FAILED = 'failed';

    /**
     * @return BelongsTo<Post, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function url(): string
    {
        return MediaDisk::disk()->url($this->path);
    }
}

<?php

namespace App\Models;

use App\Support\MediaDisk;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $conversation_id
 * @property int $user_id
 * @property string|null $body
 * @property string|null $image_path
 * @property int|null $shared_post_id
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['conversation_id', 'user_id', 'body', 'image_path', 'shared_post_id', 'read_at'])]
class Message extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Post, $this>
     */
    public function sharedPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'shared_post_id')->withTrashed();
    }

    public function imageUrl(): ?string
    {
        return $this->image_path
            ? MediaDisk::disk()->url($this->image_path)
            : null;
    }
}

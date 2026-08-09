<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

/**
 * @property int $id
 * @property int $follower_id
 * @property int $following_id
 * @property Carbon|null $created_at
 * @property-read User $follower
 * @property-read User $following
 */
#[Fillable(['follower_id', 'following_id'])]
class Follow extends Model
{
    public $timestamps = false;

    protected static function booted(): void
    {
        static::creating(function (Follow $follow): void {
            if ($follow->follower_id === $follow->following_id) {
                throw new InvalidArgumentException('Users cannot follow themselves.');
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}

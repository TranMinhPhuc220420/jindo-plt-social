<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $actor_id
 * @property int $mentioned_user_id
 * @property string $mentionable_type
 * @property int $mentionable_id
 * @property Carbon|null $created_at
 */
#[Fillable(['actor_id', 'mentioned_user_id', 'mentionable_type', 'mentionable_id'])]
class Mention extends Model
{
    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function mentionedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentioned_user_id');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function mentionable(): MorphTo
    {
        return $this->morphTo();
    }
}

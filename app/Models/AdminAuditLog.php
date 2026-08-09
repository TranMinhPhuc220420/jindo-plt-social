<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $actor_id
 * @property string $action
 * @property string $subject_type
 * @property int $subject_id
 * @property array<string, mixed>|null $meta
 * @property string|null $ip
 * @property Carbon|null $created_at
 */
#[Fillable(['actor_id', 'action', 'subject_type', 'subject_id', 'meta', 'ip'])]
class AdminAuditLog extends Model
{
    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

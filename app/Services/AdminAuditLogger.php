<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AdminAuditLogger
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public function log(
        User $actor,
        string $action,
        Model $subject,
        array $meta = [],
        ?Request $request = null,
    ): AdminAuditLog {
        return AdminAuditLog::query()->create([
            'actor_id' => $actor->id,
            'action' => $action,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'meta' => $meta === [] ? null : $meta,
            'ip' => $request?->ip(),
        ]);
    }
}

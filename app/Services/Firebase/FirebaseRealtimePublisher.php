<?php

namespace App\Services\Firebase;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Thin RTDB writer used by the Firebase broadcast driver and member sync.
 * No-ops (and logs) when Admin SDK is not configured or a write fails.
 */
class FirebaseRealtimePublisher
{
    public function __construct(private FirebaseClient $firebase) {}

    public function enabled(): bool
    {
        return $this->firebase->enabled();
    }

    /**
     * @param  array<string, mixed>|bool|float|int|string|null  $value
     */
    public function set(string $path, mixed $value): void
    {
        if (! $this->enabled()) {
            return;
        }

        try {
            $this->firebase->database()->getReference($path)->set($value);
        } catch (Throwable $e) {
            Log::warning('Firebase RTDB set failed', [
                'path' => $path,
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $value
     */
    public function update(string $path, array $value): void
    {
        if (! $this->enabled()) {
            return;
        }

        try {
            $this->firebase->database()->getReference($path)->update($value);
        } catch (Throwable $e) {
            Log::warning('Firebase RTDB update failed', [
                'path' => $path,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function remove(string $path): void
    {
        if (! $this->enabled()) {
            return;
        }

        try {
            $this->firebase->database()->getReference($path)->remove();
        } catch (Throwable $e) {
            Log::warning('Firebase RTDB remove failed', [
                'path' => $path,
                'message' => $e->getMessage(),
            ]);
        }
    }
}

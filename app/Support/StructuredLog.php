<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Throwable;

class StructuredLog
{
    /**
     * @param  array<string, mixed>  $context
     */
    public static function warning(string $message, array $context = []): void
    {
        Log::warning($message, $context);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function error(string $message, array $context = [], ?Throwable $exception = null): void
    {
        if ($exception !== null) {
            $context['exception'] = $exception->getMessage();
            $context['exception_class'] = $exception::class;
        }

        Log::error($message, $context);
    }
}

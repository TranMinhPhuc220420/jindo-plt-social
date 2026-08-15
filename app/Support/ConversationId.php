<?php

namespace App\Support;

final class ConversationId
{
    /**
     * Deterministic 1:1 conversation id: `{minUid}_{maxUid}`.
     */
    public static function between(int $a, int $b): string
    {
        $min = min($a, $b);
        $max = max($a, $b);

        return $min.'_'.$max;
    }

    /**
     * @return array{0: int, 1: int}|null
     */
    public static function parse(string $id): ?array
    {
        if (preg_match('/^(\d+)_(\d+)$/', $id, $matches) !== 1) {
            return null;
        }

        $left = (int) $matches[1];
        $right = (int) $matches[2];

        if ($left < 1 || $right < 1 || $left >= $right) {
            return null;
        }

        return [$left, $right];
    }

    public static function otherId(string $id, int $viewerId): ?int
    {
        $pair = self::parse($id);

        if ($pair === null) {
            return null;
        }

        if ($pair[0] === $viewerId) {
            return $pair[1];
        }

        if ($pair[1] === $viewerId) {
            return $pair[0];
        }

        return null;
    }

    public static function contains(string $id, int $userId): bool
    {
        return self::otherId($id, $userId) !== null;
    }
}

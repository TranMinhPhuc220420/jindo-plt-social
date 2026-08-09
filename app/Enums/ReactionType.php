<?php

namespace App\Enums;

enum ReactionType: string
{
    case Like = 'like';
    case Love = 'love';
    case Haha = 'haha';
    case Sad = 'sad';
    case Celebrate = 'celebrate';
    case Support = 'support';
    case Insightful = 'insightful';

    public function label(): string
    {
        return match ($this) {
            self::Like => 'Like',
            self::Love => 'Love',
            self::Haha => 'Haha',
            self::Sad => 'Sad',
            self::Celebrate => 'Celebrate',
            self::Support => 'Support',
            self::Insightful => 'Insightful',
        };
    }

    public function glyph(): string
    {
        return match ($this) {
            self::Like => '👍',
            self::Love => '❤️',
            self::Haha => '😆',
            self::Sad => '😢',
            self::Celebrate => '🎉',
            self::Support => '🙌',
            self::Insightful => '💡',
        };
    }

    public function verbPast(): string
    {
        return match ($this) {
            self::Like => 'liked',
            self::Love => 'loved',
            self::Haha => 'reacted Haha to',
            self::Sad => 'reacted Sad to',
            self::Celebrate => 'celebrated',
            self::Support => 'supported',
            self::Insightful => 'found insightful',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return array<string, int>
     */
    public static function emptyCounts(): array
    {
        $counts = [];

        foreach (self::cases() as $case) {
            $counts[$case->value] = 0;
        }

        return $counts;
    }
}

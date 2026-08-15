<?php

namespace App\Enums;

enum ReportReason: string
{
    case Harassment = 'harassment';
    case Fraud = 'fraud';
    case Illegal = 'illegal';
    case Copyright = 'copyright';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Harassment => 'Harassment or defamation',
            self::Fraud => 'Fraud or scam',
            self::Illegal => 'Illegal content',
            self::Copyright => 'Copyright infringement',
            self::Other => 'Other',
        };
    }
}

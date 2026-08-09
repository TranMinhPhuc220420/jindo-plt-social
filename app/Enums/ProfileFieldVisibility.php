<?php

namespace App\Enums;

enum ProfileFieldVisibility: string
{
    case Public = 'public';
    case Mutual = 'mutual';
    case OnlyMe = 'only_me';
}

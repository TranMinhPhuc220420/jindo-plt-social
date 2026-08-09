<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafePostMarkdown implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        if (preg_match('/<\/?[a-zA-Z]|<!--/', $value) === 1) {
            $fail('Post body contains disallowed markdown.');

            return;
        }

        if (preg_match('/!\[[^\]]*\]\([^)]+\)/', $value) === 1) {
            $fail('Post body contains disallowed markdown.');

            return;
        }

        if (preg_match('/^\s{0,3}#{1,6}\s/m', $value) === 1) {
            $fail('Post body contains disallowed markdown.');

            return;
        }

        if (preg_match_all('/\[[^\]]*\]\(([^)]+)\)/', $value, $matches) > 0) {
            foreach ($matches[1] as $target) {
                if (! $this->isAllowedLinkTarget((string) $target)) {
                    $fail('Post body contains disallowed markdown.');

                    return;
                }
            }
        }
    }

    private function isAllowedLinkTarget(string $target): bool
    {
        $target = trim($target);

        if (preg_match('/^<([^>]+)>/', $target, $match) === 1) {
            $target = $match[1];
        } elseif (preg_match('/^(\S+)/', $target, $match) === 1) {
            $target = $match[1];
        }

        $target = trim($target);

        return preg_match('#^https?://#i', $target) === 1;
    }
}

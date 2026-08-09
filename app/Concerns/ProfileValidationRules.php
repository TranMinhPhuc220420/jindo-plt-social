<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'username' => $this->usernameRules($userId),
            'email' => $this->emailRules($userId),
        ];
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function socialProfileRules(?int $userId = null): array
    {
        $visibility = ['nullable', 'string', Rule::in(['public', 'mutual', 'only_me'])];

        return [
            ...$this->profileRules($userId),
            'bio' => ['nullable', 'string', 'max:160'],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'cover' => ['nullable', 'image', 'max:4096'],
            'workplace' => ['nullable', 'string', 'max:120'],
            'education' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
            'hometown' => ['nullable', 'string', 'max:120'],
            'website' => ['nullable', 'url', 'max:255'],
            'birthday' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'max:60'],
            'relationship_status' => ['nullable', 'string', 'max:60'],
            'profile_privacy' => ['nullable', 'array'],
            'profile_privacy.workplace' => $visibility,
            'profile_privacy.education' => $visibility,
            'profile_privacy.location' => $visibility,
            'profile_privacy.hometown' => $visibility,
            'profile_privacy.website' => $visibility,
            'profile_privacy.birthday' => $visibility,
            'profile_privacy.gender' => $visibility,
            'profile_privacy.relationship_status' => $visibility,
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Username: lowercase alphanumeric + underscores, 3–30 chars.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function usernameRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'min:3',
            'max:30',
            'regex:/^[a-z0-9_]+$/',
            $userId === null
                ? Rule::unique(User::class, 'username')
                : Rule::unique(User::class, 'username')->ignore($userId),
        ];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}

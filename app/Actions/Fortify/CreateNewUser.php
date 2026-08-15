<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user (public Fortify path).
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        if (! (bool) config('fortify.public_registration')) {
            abort(403);
        }

        $this->validateInput($input);

        return $this->provision($input);
    }

    /**
     * Persist a member account. Callers must already have validated input
     * (Fortify `create()` or admin StoreUserRequest).
     *
     * @param  array<string, mixed>  $input
     */
    public function provision(array $input, bool $verified = false): User
    {
        if (isset($input['username']) && is_string($input['username'])) {
            $input['username'] = Str::lower($input['username']);
        }

        $user = User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => UserRole::User,
            'birthday' => $input['birthday'] ?? null,
            'guardian_name' => $input['guardian_name'] ?? null,
            'guardian_email' => $input['guardian_email'] ?? null,
            'guardian_relationship' => $input['guardian_relationship'] ?? null,
            'guardian_consented_at' => ! empty($input['guardian_consented']) ? now() : null,
            'child_consented_at' => ! empty($input['child_consented']) ? now() : null,
            'under18_attested_at' => ! empty($input['under18_attested']) ? now() : null,
        ]);

        if ($verified) {
            $user->markEmailAsVerified();
        }

        return $user;
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function validateInput(array &$input): void
    {
        if (isset($input['username']) && is_string($input['username'])) {
            $input['username'] = Str::lower($input['username']);
        }

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();
    }
}

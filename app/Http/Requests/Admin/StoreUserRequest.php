<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('username')) {
            $this->merge([
                'username' => Str::lower((string) $this->input('username')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'birthday' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'guardian_relationship' => ['nullable', 'string', 'max:120'],
            'guardian_consented' => ['sometimes', 'boolean'],
            'child_consented' => ['sometimes', 'boolean'],
            'under18_attested' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->has('birthday')) {
                return;
            }

            $birthday = $this->input('birthday');

            if (! is_string($birthday) || $birthday === '') {
                return;
            }

            $age = Carbon::parse($birthday)->age;

            if ($age < 16) {
                if (blank($this->input('guardian_name'))) {
                    $validator->errors()->add('guardian_name', __('Guardian name is required for members under 16.'));
                }

                if (blank($this->input('guardian_email'))) {
                    $validator->errors()->add('guardian_email', __('Guardian email is required for members under 16.'));
                }

                if (blank($this->input('guardian_relationship'))) {
                    $validator->errors()->add('guardian_relationship', __('Guardian relationship is required for members under 16.'));
                }

                if (! $this->boolean('guardian_consented')) {
                    $validator->errors()->add('guardian_consented', __('Confirm guardian consent before creating this account.'));
                }

                if ($age >= 7 && ! $this->boolean('child_consented')) {
                    $validator->errors()->add('child_consented', __('Confirm the learner also consented (age 7–15).'));
                }
            }

            if ($age >= 16 && $age < 18 && ! $this->boolean('under18_attested')) {
                $validator->errors()->add('under18_attested', __('Confirm a parent or school is aware this 16–17 year old is joining.'));
            }
        });
    }
}

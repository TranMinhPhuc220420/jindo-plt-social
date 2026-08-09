<?php

namespace App\Http\Requests;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateSocialProfileRequest extends FormRequest
{
    use ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user() !== null;
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
        return $this->socialProfileRules($this->user()->id);
    }
}

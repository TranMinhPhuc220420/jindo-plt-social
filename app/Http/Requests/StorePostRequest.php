<?php

namespace App\Http\Requests;

use App\Models\Post;
use App\Rules\SafePostMarkdown;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Post::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000', new SafePostMarkdown],
            'images' => ['nullable', 'array', 'max:6'],
            'images.*' => ['image', 'max:5120'],
        ];
    }
}

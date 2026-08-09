<?php

namespace App\Http\Requests;

use App\Models\Post;
use App\Rules\SafePostMarkdown;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('post')) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Post|null $post */
        $post = $this->route('post');
        $isShare = $post instanceof Post && $post->shared_post_id !== null;

        if ($isShare) {
            return [
                'body' => ['nullable', 'string', 'max:2000', new SafePostMarkdown],
            ];
        }

        return [
            'body' => ['required', 'string', 'max:2000', new SafePostMarkdown],
            'images' => ['nullable', 'array', 'max:6'],
            'images.*' => ['image', 'max:5120'],
            'remove_media_ids' => ['sometimes', 'array'],
            'remove_media_ids.*' => ['integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var Post|null $post */
            $post = $this->route('post');

            if (! $post instanceof Post || $post->shared_post_id === null) {
                return;
            }

            if ($this->hasFile('images') || $this->filled('remove_media_ids')) {
                $validator->errors()->add(
                    'images',
                    __('Shared posts cannot have media.'),
                );
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): mixed
    {
        $validated = parent::validated($key, $default);

        if ($key !== null) {
            return $validated;
        }

        /** @var Post|null $post */
        $post = $this->route('post');

        if ($post instanceof Post && $post->shared_post_id !== null) {
            $validated['body'] = is_string($validated['body'] ?? null)
                ? $validated['body']
                : '';
            $validated['images'] = [];
            $validated['remove_media_ids'] = [];
        }

        return $validated;
    }
}

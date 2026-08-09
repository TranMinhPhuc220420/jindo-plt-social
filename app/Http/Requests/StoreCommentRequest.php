<?php

namespace App\Http\Requests;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Comment::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $parentId = $this->integer('parent_id');

            if ($parentId === 0) {
                return;
            }

            /** @var Post $post */
            $post = $this->route('post');
            $parent = Comment::query()->find($parentId);

            if ($parent === null) {
                return;
            }

            if ($parent->post_id !== $post->id) {
                $validator->errors()->add('parent_id', __('Reply must belong to the same post.'));
            }

            if ($parent->parent_id !== null) {
                $validator->errors()->add('parent_id', __('Only one level of replies is allowed.'));
            }
        });
    }
}

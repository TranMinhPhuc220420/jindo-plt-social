<?php

namespace App\Http\Requests;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Conversation $conversation */
        $conversation = $this->route('conversation');

        return $this->user()?->can('create', [Message::class, $conversation]) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:2000', 'required_without_all:image,shared_post_id'],
            'image' => ['nullable', 'image', 'max:5120', 'required_without_all:body,shared_post_id'],
            'shared_post_id' => ['nullable', 'integer', 'exists:posts,id', 'required_without_all:body,image'],
        ];
    }
}

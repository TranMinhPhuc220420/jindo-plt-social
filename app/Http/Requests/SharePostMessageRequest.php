<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\SafePostMarkdown;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SharePostMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'usernames' => ['required', 'array', 'min:1', 'max:10'],
            'usernames.*' => ['required', 'string', 'distinct', 'exists:users,username'],
            'body' => ['nullable', 'string', 'max:2000', new SafePostMarkdown],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $actor = $this->user();

            if ($actor === null) {
                return;
            }

            $usernames = $this->input('usernames', []);

            if (! is_array($usernames)) {
                return;
            }

            foreach ($usernames as $index => $username) {
                if (! is_string($username)) {
                    continue;
                }

                $target = User::query()->where('username', $username)->first();

                if ($target === null) {
                    continue;
                }

                if ($target->id === $actor->id) {
                    $validator->errors()->add(
                        "usernames.{$index}",
                        __('You cannot message yourself.'),
                    );

                    continue;
                }

                if (! $actor->isMutualWith($target)) {
                    $validator->errors()->add(
                        "usernames.{$index}",
                        __('You can only message mutual followers.'),
                    );
                }
            }
        });
    }
}

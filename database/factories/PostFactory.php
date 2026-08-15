<?php

namespace Database\Factories;

use App\Enums\PostModerationStatus;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'body' => fake()->paragraph(),
            'moderation_status' => PostModerationStatus::Approved,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'moderation_status' => PostModerationStatus::Pending,
            'moderation_reason' => null,
            'reviewed_at' => null,
            'reviewed_by' => null,
        ]);
    }

    public function rejected(string $reason = 'Does not meet community guidelines.'): static
    {
        return $this->state(fn (): array => [
            'moderation_status' => PostModerationStatus::Rejected,
            'moderation_reason' => $reason,
            'reviewed_at' => now(),
        ]);
    }
}

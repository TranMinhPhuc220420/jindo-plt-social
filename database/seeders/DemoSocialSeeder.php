<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSocialSeeder extends Seeder
{
    /**
     * Seed demo users, follows, and posts for local development.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin,
        ]);

        $alice = User::factory()->create([
            'name' => 'Alice',
            'username' => 'alice',
            'email' => 'alice@example.com',
        ]);

        $bob = User::factory()->create([
            'name' => 'Bob',
            'username' => 'bob',
            'email' => 'bob@example.com',
        ]);

        $carol = User::factory()->create([
            'name' => 'Carol',
            'username' => 'carol',
            'email' => 'carol@example.com',
        ]);

        Follow::query()->create([
            'follower_id' => $alice->id,
            'following_id' => $bob->id,
        ]);

        Follow::query()->create([
            'follower_id' => $alice->id,
            'following_id' => $carol->id,
        ]);

        Follow::query()->create([
            'follower_id' => $bob->id,
            'following_id' => $alice->id,
        ]);

        Post::factory()->count(5)->create(['user_id' => $alice->id]);
        Post::factory()->count(3)->create(['user_id' => $bob->id]);
        Post::factory()->count(2)->create(['user_id' => $carol->id]);
        Post::factory()->count(1)->create(['user_id' => $admin->id]);
    }
}

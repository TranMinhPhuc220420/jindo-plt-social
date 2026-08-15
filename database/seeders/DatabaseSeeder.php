<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $testUser = LearningCommunityCatalog::testUser();

        User::factory()->create([
            'name' => $testUser['name'],
            'username' => $testUser['username'],
            'email' => $testUser['email'],
            'bio' => $testUser['bio'],
            'education' => $testUser['education'],
            'birthday' => $testUser['birthday'],
        ]);

        if (app()->environment('local')) {
            $this->call(DemoSocialSeeder::class);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Enums\PostModerationStatus;
use App\Enums\ReactionType;
use App\Enums\UserRole;
use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use App\Services\HashtagService;
use App\Services\MentionService;
use Database\Seeders\Support\DemoMediaDownloader;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoSocialSeeder extends Seeder
{
    /**
     * Seed a Vietnamese learning-community demo for local development.
     */
    public function run(): void
    {
        $members = $this->seedMembers();
        $admin = $members['admin'];

        $this->seedFollows($members);
        $this->seedPosts($members, $admin);
    }

    /**
     * @return array<string, User>
     */
    private function seedMembers(): array
    {
        $byUsername = [];

        foreach (LearningCommunityCatalog::members() as $member) {
            $user = User::query()->where('email', $member['email'])->first();

            if ($user === null) {
                $user = User::factory()->create([
                    'name' => $member['name'],
                    'username' => $member['username'],
                    'email' => $member['email'],
                    'bio' => $member['bio'],
                    'education' => $member['education'],
                    'birthday' => $member['birthday'],
                    'role' => $member['is_admin'] ? UserRole::Admin : UserRole::User,
                ]);
            }

            $byUsername[$member['username']] = $user;
        }

        return $byUsername;
    }

    /**
     * @param  array<string, User>  $members
     */
    private function seedFollows(array $members): void
    {
        $graph = [
            'testuser' => ['admin', 'huy', 'mai', 'tuan', 'thanhha', 'linh', 'bao'],
            'admin' => ['huy', 'thanhha', 'testuser'],
            'huy' => ['admin', 'thanhha', 'testuser', 'mai'],
            'mai' => ['admin', 'huy', 'testuser', 'linh'],
            'tuan' => ['admin', 'huy', 'thanhha', 'testuser'],
            'thanhha' => ['admin', 'huy', 'linh', 'bao'],
            'linh' => ['admin', 'thanhha', 'mai', 'testuser'],
            'bao' => ['admin', 'huy', 'thanhha', 'testuser'],
        ];

        foreach ($graph as $followerUsername => $followingUsernames) {
            $follower = $members[$followerUsername];

            foreach ($followingUsernames as $followingUsername) {
                $following = $members[$followingUsername];

                Follow::query()->firstOrCreate([
                    'follower_id' => $follower->id,
                    'following_id' => $following->id,
                ]);
            }
        }
    }

    /**
     * @param  array<string, User>  $members
     */
    private function seedPosts(array $members, User $admin): void
    {
        $hashtags = app(HashtagService::class);
        $mentions = app(MentionService::class);
        $media = new DemoMediaDownloader(LearningCommunityCatalog::images(), $this->command);

        foreach (LearningCommunityCatalog::posts() as $row) {
            $author = $members[$row['author']] ?? null;

            if ($author === null) {
                $this->command->warn("Skipping post: unknown author [{$row['author']}].");

                continue;
            }
            $createdAt = Carbon::now()->subDays($row['days_ago'])->subMinutes($author->id * 7);

            $post = new Post([
                'user_id' => $author->id,
                'body' => $row['body'],
                'moderation_status' => PostModerationStatus::Approved,
                'moderation_reason' => null,
                'reviewed_at' => $createdAt->copy()->addHour(),
                'reviewed_by' => $admin->id,
            ]);
            $post->created_at = $createdAt;
            $post->updated_at = $createdAt;
            $post->save();

            $hashtags->syncFor($post, $post->body);
            $mentions->syncFor($post, $author, $post->body);

            foreach ($row['image_keys'] as $position => $imageKey) {
                $media->attach($post, $imageKey, $position);
            }

            foreach ($row['comments'] as $commentRow) {
                $commenter = $members[$commentRow['author']] ?? null;

                if ($commenter === null) {
                    continue;
                }

                $commentAt = $createdAt->copy()->addHours($commentRow['hours_after']);

                $comment = new Comment([
                    'user_id' => $commenter->id,
                    'post_id' => $post->id,
                    'body' => $commentRow['body'],
                ]);
                $comment->created_at = $commentAt;
                $comment->updated_at = $commentAt;
                $comment->save();
            }

            foreach ($row['reactions'] as $reactionRow) {
                $reactor = $members[$reactionRow['author']] ?? null;

                if ($reactor === null) {
                    continue;
                }

                $type = ReactionType::from($reactionRow['type']);

                Like::query()->firstOrCreate(
                    [
                        'user_id' => $reactor->id,
                        'post_id' => $post->id,
                    ],
                    ['type' => $type],
                );
            }
        }
    }
}

<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Mention;
use App\Models\Post;
use App\Models\User;
use App\Notifications\UserMentionedNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class MentionService
{
    public const MAX_MENTIONS = 10;

    /**
     * @return list<string>
     */
    public function extractUsernames(string $body): array
    {
        preg_match_all('/(^|[^A-Za-z0-9_])@([A-Za-z0-9_]{3,30})\b/', $body, $matches);

        $usernames = [];

        foreach ($matches[2] as $username) {
            $key = strtolower($username);

            if (! isset($usernames[$key])) {
                $usernames[$key] = $username;
            }

            if (count($usernames) >= self::MAX_MENTIONS) {
                break;
            }
        }

        return array_values($usernames);
    }

    public function syncFor(Model $mentionable, User $actor, string $body): void
    {
        if (! $mentionable instanceof Post && ! $mentionable instanceof Comment) {
            return;
        }

        $usernames = $this->extractUsernames($body);

        /** @var Collection<string, User> $users */
        $users = collect();

        if ($usernames !== []) {
            $users = User::query()
                ->where(function ($query) use ($usernames): void {
                    foreach ($usernames as $username) {
                        $query->orWhereRaw('LOWER(username) = ?', [strtolower($username)]);
                    }
                })
                ->get()
                ->keyBy(fn (User $user) => strtolower($user->username));
        }

        $resolvedIds = $users->pluck('id')->all();

        $existing = Mention::query()
            ->where('mentionable_type', $mentionable::class)
            ->where('mentionable_id', $mentionable->getKey())
            ->get();

        $existingIds = $existing->pluck('mentioned_user_id')->all();

        $toRemove = array_diff($existingIds, $resolvedIds);

        if ($toRemove !== []) {
            Mention::query()
                ->where('mentionable_type', $mentionable::class)
                ->where('mentionable_id', $mentionable->getKey())
                ->whereIn('mentioned_user_id', $toRemove)
                ->delete();
        }

        $post = $mentionable instanceof Post
            ? $mentionable
            : $mentionable->post()->first();

        foreach ($users as $user) {
            if ($user->id === $actor->id) {
                continue;
            }

            $mention = Mention::query()->firstOrCreate([
                'mentioned_user_id' => $user->id,
                'mentionable_type' => $mentionable::class,
                'mentionable_id' => $mentionable->getKey(),
            ], [
                'actor_id' => $actor->id,
            ]);

            if ($mention->wasRecentlyCreated && $post instanceof Post) {
                $user->notify(new UserMentionedNotification($actor, $post, $mentionable));
            }
        }
    }
}

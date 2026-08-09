<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;

class HashtagService
{
    public const MAX_TAGS = 5;

    /**
     * @return list<string>
     */
    public function extractSlugs(string $body): array
    {
        preg_match_all('/(^|[^A-Za-z0-9_])#([A-Za-z0-9_]{2,40})\b/', $body, $matches);

        $slugs = [];

        foreach ($matches[2] as $raw) {
            $slug = strtolower($raw);

            if (! isset($slugs[$slug])) {
                $slugs[$slug] = $slug;
            }

            if (count($slugs) >= self::MAX_TAGS) {
                break;
            }
        }

        return array_values($slugs);
    }

    public function syncFor(Post $post, string $body): void
    {
        $slugs = $this->extractSlugs($body);
        $tagIds = [];

        foreach ($slugs as $slug) {
            $tag = Tag::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $slug],
            );
            $tagIds[] = $tag->id;
        }

        $post->tags()->sync($tagIds);
    }
}

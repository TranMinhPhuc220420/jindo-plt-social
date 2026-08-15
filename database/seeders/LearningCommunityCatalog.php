<?php

namespace Database\Seeders;

use RuntimeException;

final class LearningCommunityCatalog
{
    /**
     * @return list<array{
     *     username: string,
     *     email: string,
     *     name: string,
     *     is_admin: bool,
     *     bio: string,
     *     education: string,
     *     birthday: string
     * }>
     */
    public static function members(): array
    {
        $rows = require __DIR__.'/data/learning_members.php';

        if (! is_array($rows)) {
            throw new RuntimeException('learning_members.php must return an array.');
        }

        /** @var list<array{username: string, email: string, name: string, is_admin: bool, bio: string, education: string, birthday: string}> $rows */
        return $rows;
    }

    /**
     * @return array{username: string, email: string, name: string, is_admin: bool, bio: string, education: string, birthday: string}
     */
    public static function testUser(): array
    {
        foreach (self::members() as $member) {
            if ($member['username'] === 'testuser') {
                return $member;
            }
        }

        throw new RuntimeException('testuser is missing from learning_members.php.');
    }

    /**
     * @return array<string, array{url: string, source: string, attribution: string}>
     */
    public static function images(): array
    {
        $rows = require __DIR__.'/data/learning_images.php';

        if (! is_array($rows)) {
            throw new RuntimeException('learning_images.php must return an array.');
        }

        /** @var array<string, array{url: string, source: string, attribution: string}> $rows */
        return $rows;
    }

    /**
     * @return list<array{
     *     author: string,
     *     days_ago: int,
     *     body: string,
     *     image_keys: list<string>,
     *     comments: list<array{author: string, body: string, hours_after: int}>,
     *     reactions: list<array{author: string, type: string}>
     * }>
     */
    public static function posts(): array
    {
        $rows = require __DIR__.'/data/learning_posts.php';

        if (! is_array($rows)) {
            throw new RuntimeException('learning_posts.php must return an array.');
        }

        /** @var list<array{author: string, days_ago: int, body: string, image_keys: list<string>, comments: list<array{author: string, body: string, hours_after: int}>, reactions: list<array{author: string, type: string}>}> $rows */
        return $rows;
    }
}

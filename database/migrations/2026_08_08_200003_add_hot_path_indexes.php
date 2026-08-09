<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Confirm / add hot-path indexes. Most were created with earlier domain migrations;
 * this migration only adds indexes that were still missing.
 *
 * See docs/design/002-phase3-perf.md for the full index inventory.
 */
return new class extends Migration
{
    public function up(): void
    {
        // likes: unique(user_id, post_id) does not cover post_id-leading lookups on all engines.
        // Skip when an index already exists on post_id alone (including the FK index).
        if (! $this->hasIndexContaining('likes', ['post_id'])) {
            Schema::table('likes', function (Blueprint $table) {
                $table->index('post_id', 'likes_post_id_index');
            });
        }

        // comments.user_id is covered by FK index from foreignId(); no-op when present.
        if (! $this->hasIndexContaining('comments', ['user_id'])) {
            Schema::table('comments', function (Blueprint $table) {
                $table->index('user_id', 'comments_user_id_index');
            });
        }
    }

    public function down(): void
    {
        // Only drop indexes this migration may have created — never the FK indexes
        // (e.g. likes_post_id_foreign), which MySQL refuses to drop while the FK exists.
        if ($this->hasNamedIndex('likes', 'likes_post_id_index')) {
            Schema::table('likes', function (Blueprint $table) {
                $table->dropIndex('likes_post_id_index');
            });
        }

        if ($this->hasNamedIndex('comments', 'comments_user_id_index')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropIndex('comments_user_id_index');
            });
        }
    }

    /**
     * @param  list<string>  $columns
     */
    private function hasIndexContaining(string $table, array $columns): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (($index['columns'] ?? []) === $columns) {
                return true;
            }
        }

        return false;
    }

    private function hasNamedIndex(string $table, string $name): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (($index['name'] ?? null) === $name) {
                return true;
            }
        }

        return false;
    }
};

<?php

namespace App\Models;

use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $body
 * @property int|null $shared_post_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $user
 * @property-read Post|null $sharedPost
 * @property-read int|null $likes_count
 * @property-read int|null $comments_count
 * @property-read int|null $shares_count
 * @property-read bool|null $liked_by_viewer
 */
#[Fillable(['user_id', 'body', 'shared_post_id'])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Resolve the root post for sharing (flatten one level of shares).
     */
    public static function shareRoot(Post $post): Post
    {
        if ($post->shared_post_id === null) {
            return $post;
        }

        $root = $post->relationLoaded('sharedPost')
            ? $post->sharedPost
            : Post::query()->withTrashed()->find($post->shared_post_id);

        return $root ?? $post;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Post, $this>
     */
    public function sharedPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'shared_post_id')->withTrashed();
    }

    /**
     * @return HasMany<Post, $this>
     */
    public function shares(): HasMany
    {
        return $this->hasMany(Post::class, 'shared_post_id');
    }

    /**
     * @return HasMany<Like, $this>
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return HasMany<Bookmark, $this>
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * @return HasMany<PostMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class)->orderBy('position');
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }
}

<?php

namespace App\Models;

use App\Enums\PostModerationStatus;
use Carbon\CarbonInterface;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
 * @property PostModerationStatus $moderation_status
 * @property string|null $moderation_reason
 * @property CarbonInterface|null $reviewed_at
 * @property int|null $reviewed_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $user
 * @property-read User|null $reviewer
 * @property-read Post|null $sharedPost
 * @property-read int|null $likes_count
 * @property-read int|null $comments_count
 * @property-read int|null $shares_count
 * @property-read bool|null $liked_by_viewer
 */
#[Fillable([
    'user_id',
    'body',
    'shared_post_id',
    'moderation_status',
    'moderation_reason',
    'reviewed_at',
    'reviewed_by',
])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'moderation_status' => PostModerationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function isApproved(): bool
    {
        return $this->moderation_status === PostModerationStatus::Approved;
    }

    public function isPending(): bool
    {
        return $this->moderation_status === PostModerationStatus::Pending;
    }

    /**
     * @param  Builder<Post>  $query
     */
    public function scopeApproved(Builder $query): void
    {
        $query->where('moderation_status', PostModerationStatus::Approved);
    }

    /**
     * Approved posts, plus the viewer's own pending/rejected rows.
     *
     * @param  Builder<Post>  $query
     */
    public function scopeVisibleTo(Builder $query, User $viewer): void
    {
        $query->where(function (Builder $inner) use ($viewer): void {
            $inner->where('moderation_status', PostModerationStatus::Approved)
                ->orWhere('user_id', $viewer->id);
        });
    }

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
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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

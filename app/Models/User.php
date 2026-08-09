<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Support\MediaDisk;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string|null $bio
 * @property string|null $workplace
 * @property string|null $education
 * @property string|null $location
 * @property string|null $hometown
 * @property string|null $website
 * @property Carbon|null $birthday
 * @property string|null $gender
 * @property string|null $relationship_status
 * @property array<string, string>|null $profile_privacy
 * @property string|null $avatar_path
 * @property string|null $cover_path
 * @property UserRole $role
 * @property Carbon|null $suspended_at
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'username',
    'email',
    'password',
    'bio',
    'workplace',
    'education',
    'location',
    'hometown',
    'website',
    'birthday',
    'gender',
    'relationship_status',
    'profile_privacy',
    'avatar_path',
    'cover_path',
    'role',
    'suspended_at',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'suspended_at' => 'datetime',
            'birthday' => 'date',
            'profile_privacy' => 'array',
            'role' => UserRole::class,
        ];
    }

    /**
     * @return HasMany<Post, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
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
     * Users this user follows.
     *
     * @return BelongsToMany<User, $this>
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withPivot('created_at');
    }

    /**
     * Users who follow this user.
     *
     * @return BelongsToMany<User, $this>
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withPivot('created_at');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    public function isFollowing(User $other): bool
    {
        return $this->following()->where('users.id', $other->id)->exists();
    }

    public function isMutualWith(User $other): bool
    {
        return $this->id !== $other->id
            && $this->isFollowing($other)
            && $other->isFollowing($this);
    }

    /**
     * @return BelongsToMany<Conversation, $this>
     */
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withTimestamps();
    }

    public function avatarUrl(): ?string
    {
        return $this->avatar_path
            ? MediaDisk::disk()->url($this->avatar_path)
            : null;
    }

    public function coverUrl(): ?string
    {
        return $this->cover_path
            ? MediaDisk::disk()->url($this->cover_path)
            : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        $array['avatar'] = $this->avatarUrl() ?? '';
        $array['cover'] = $this->coverUrl() ?? '';
        $array['role'] = $this->role->value;

        return $array;
    }
}

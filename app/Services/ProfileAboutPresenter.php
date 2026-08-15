<?php

namespace App\Services;

use App\Enums\PostModerationStatus;
use App\Enums\ProfileFieldVisibility;
use App\Models\PostMedia;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ProfileAboutPresenter
{
    /**
     * @var list<string>
     */
    public const FIELDS = [
        'education',
    ];

    /**
     * @var array<string, string>
     */
    public const LABELS = [
        'education' => 'Studied at',
    ];

    /**
     * @var array<string, ProfileFieldVisibility>
     */
    public const DEFAULT_VISIBILITY = [
        'education' => ProfileFieldVisibility::Public,
    ];

    /**
     * Visible About fields for a viewer (values only; no privacy keys for non-owners).
     *
     * @return list<array{key: string, label: string, value: string}>
     */
    public function visibleFields(User $profile, User $viewer): array
    {
        $isOwn = $viewer->id === $profile->id;
        $isMutual = ! $isOwn && $viewer->isMutualWith($profile);
        $privacy = $this->resolvedPrivacy($profile);

        if (! $isOwn && $profile->isChild()) {
            return [];
        }

        $fields = [];

        foreach (self::FIELDS as $key) {
            $raw = $this->rawValue($profile, $key);

            if ($raw === null || $raw === '') {
                continue;
            }

            if (! $isOwn && ! $this->canView($privacy[$key], $isMutual)) {
                continue;
            }

            $fields[] = [
                'key' => $key,
                'label' => self::LABELS[$key],
                'value' => $this->displayValue($key, $raw),
            ];
        }

        return $fields;
    }

    /**
     * Full About payload for settings (owner): values + privacy per field.
     *
     * @return array{
     *     fields: list<array{key: string, label: string, value: string|null, visibility: string}>,
     * }
     */
    public function forSettings(User $user): array
    {
        $privacy = $this->resolvedPrivacy($user);

        $fields = [];

        foreach (self::FIELDS as $key) {
            $raw = $this->rawValue($user, $key);

            $fields[] = [
                'key' => $key,
                'label' => self::LABELS[$key],
                'value' => $raw === null || $raw === '' ? null : (string) $raw,
                'visibility' => $privacy[$key]->value,
            ];
        }

        return ['fields' => $fields];
    }

    /**
     * @return array<string, ProfileFieldVisibility>
     */
    public function resolvedPrivacy(User $user): array
    {
        /** @var array<string, mixed> $stored */
        $stored = is_array($user->profile_privacy) ? $user->profile_privacy : [];

        $resolved = [];

        foreach (self::FIELDS as $key) {
            $default = self::DEFAULT_VISIBILITY[$key];
            $value = $stored[$key] ?? null;

            $resolved[$key] = is_string($value)
                ? (ProfileFieldVisibility::tryFrom($value) ?? $default)
                : $default;
        }

        return $resolved;
    }

    /**
     * Latest ready photos for a profile user.
     *
     * @return list<array{id: int, url: string, post_id: int}>
     */
    public function photosPreview(User $profile, int $limit = 9): array
    {
        return array_values($this->photosQuery($profile)
            ->limit($limit)
            ->get()
            ->map(fn (PostMedia $media) => [
                'id' => $media->id,
                'url' => $media->url(),
                'post_id' => $media->post_id,
            ])
            ->all());
    }

    /**
     * @return CursorPaginator<int, PostMedia>
     */
    public function photosPaginated(User $profile, int $perPage = 24): CursorPaginator
    {
        return $this->photosQuery($profile)->cursorPaginate($perPage);
    }

    /**
     * @param  CursorPaginator<int, PostMedia>|Collection<int, PostMedia>  $media
     * @return list<array{id: int, url: string, post_id: int}>
     */
    public function presentMedia($media): array
    {
        $items = $media instanceof CursorPaginator
            ? collect($media->items())
            : $media;

        return array_values($items
            ->map(fn (PostMedia $item) => [
                'id' => $item->id,
                'url' => $item->url(),
                'post_id' => $item->post_id,
            ])
            ->all());
    }

    private function canView(ProfileFieldVisibility $visibility, bool $isMutual): bool
    {
        return match ($visibility) {
            ProfileFieldVisibility::Public => true,
            ProfileFieldVisibility::Mutual => $isMutual,
            ProfileFieldVisibility::OnlyMe => false,
        };
    }

    private function rawValue(User $user, string $key): mixed
    {
        $value = $user->getAttribute($key);

        if ($key === 'birthday' && $value !== null) {
            return $value instanceof \DateTimeInterface
                ? $value->format('Y-m-d')
                : (string) $value;
        }

        return $value;
    }

    private function displayValue(string $key, mixed $raw): string
    {
        if ($key === 'birthday') {
            try {
                return Carbon::parse((string) $raw)->format('F j, Y');
            } catch (\Throwable) {
                return (string) $raw;
            }
        }

        return (string) $raw;
    }

    /**
     * @return Builder<PostMedia>
     */
    private function photosQuery(User $profile)
    {
        return PostMedia::query()
            ->where('status', PostMedia::STATUS_READY)
            ->whereHas('post', function ($query) use ($profile) {
                $query->where('user_id', $profile->id)
                    ->where('moderation_status', PostModerationStatus::Approved);
            })
            ->orderByDesc('id');
    }
}

<?php

namespace App\Services;

use App\Enums\PostModerationStatus;
use App\Models\Mention;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostModeratedNotification;
use App\Notifications\PostSharedNotification;
use App\Notifications\UserMentionedNotification;
use DateTimeInterface;
use Illuminate\Support\Carbon;

class PostModerationService
{
    /**
     * @return array{
     *     moderation_status: PostModerationStatus,
     *     moderation_reason: null,
     *     reviewed_at: Carbon|null,
     *     reviewed_by: int|null
     * }
     */
    public function attributesForWriter(User $writer): array
    {
        if ($writer->isAdmin()) {
            return [
                'moderation_status' => PostModerationStatus::Approved,
                'moderation_reason' => null,
                'reviewed_at' => Carbon::now(),
                'reviewed_by' => $writer->id,
            ];
        }

        return [
            'moderation_status' => PostModerationStatus::Pending,
            'moderation_reason' => null,
            'reviewed_at' => null,
            'reviewed_by' => null,
        ];
    }

    /**
     * Member edits re-enter the queue. Admin edits stay published.
     * Previous reviewed_at is kept on member requeue so mention notify can skip already-sent rows.
     */
    public function applyWriterStatus(Post $post, User $writer): void
    {
        if ($writer->isAdmin()) {
            $post->moderation_status = PostModerationStatus::Approved;
            $post->moderation_reason = null;
            $post->reviewed_at = Carbon::now();
            $post->reviewed_by = $writer->id;

            return;
        }

        $post->moderation_status = PostModerationStatus::Pending;
        $post->moderation_reason = null;
    }

    public function approve(Post $post, User $admin): void
    {
        $wasApproved = $post->isApproved();
        $previousReviewedAt = $post->reviewed_at;

        $post->update([
            'moderation_status' => PostModerationStatus::Approved,
            'moderation_reason' => null,
            'reviewed_at' => Carbon::now(),
            'reviewed_by' => $admin->id,
        ]);

        if ($wasApproved) {
            return;
        }

        $this->notifyMentions($post, $previousReviewedAt);
        $this->notifyShare($post);
        $this->notifyAuthor($post, $admin, PostModerationStatus::Approved);
    }

    public function reject(Post $post, User $admin, string $reason): void
    {
        $post->update([
            'moderation_status' => PostModerationStatus::Rejected,
            'moderation_reason' => $reason,
            'reviewed_at' => Carbon::now(),
            'reviewed_by' => $admin->id,
        ]);

        $this->notifyAuthor($post, $admin, PostModerationStatus::Rejected, $reason);
    }

    private function notifyMentions(Post $post, ?DateTimeInterface $since): void
    {
        $query = Mention::query()
            ->with(['mentionedUser', 'actor'])
            ->where('mentionable_type', Post::class)
            ->where('mentionable_id', $post->id);

        if ($since !== null) {
            $query->where('created_at', '>', $since);
        }

        foreach ($query->get() as $mention) {
            $mentioned = $mention->mentionedUser;
            $actor = $mention->actor;

            if ($mentioned === null || $actor === null || $mentioned->id === $actor->id) {
                continue;
            }

            $mentioned->notify(new UserMentionedNotification($actor, $post, $post));
        }
    }

    private function notifyShare(Post $post): void
    {
        if ($post->shared_post_id === null) {
            return;
        }

        $post->loadMissing(['user', 'sharedPost.user']);
        $root = $post->sharedPost;

        if ($root === null || $root->user_id === $post->user_id) {
            return;
        }

        $root->user->notify(new PostSharedNotification($post->user, $post, $root));
    }

    private function notifyAuthor(
        Post $post,
        User $admin,
        PostModerationStatus $status,
        ?string $reason = null,
    ): void {
        $post->loadMissing('user');

        if ($post->user_id === $admin->id) {
            return;
        }

        $post->user->notify(new PostModeratedNotification($admin, $post, $status, $reason));
    }
}

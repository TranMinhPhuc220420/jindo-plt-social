<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ReportPolicy
{
    public function create(User $user, Model $reportable): bool
    {
        if ($user->isSuspended()) {
            return false;
        }

        if ($reportable instanceof Post) {
            return $reportable->isApproved() && $reportable->user_id !== $user->id;
        }

        if ($reportable instanceof Comment) {
            $reportable->loadMissing('post');

            return $reportable->post->isApproved()
                && $reportable->user_id !== $user->id;
        }

        return false;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Report $report): bool
    {
        return $user->isAdmin() && $report->isOpen();
    }
}

<?php

namespace App\Services;

use App\Enums\ReportReason;
use App\Enums\ReportStatus;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ReportService
{
    public function __construct(
        private readonly PostModerationService $moderation,
    ) {}

    public function submit(User $reporter, Model $target, ReportReason $reason, ?string $details): Report
    {
        $exists = Report::query()
            ->where('reporter_id', $reporter->id)
            ->where('reportable_type', $target::class)
            ->where('reportable_id', $target->getKey())
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'reportable_id' => __('You already reported this.'),
            ]);
        }

        return Report::query()->create([
            'reporter_id' => $reporter->id,
            'reportable_type' => $target::class,
            'reportable_id' => $target->getKey(),
            'reason' => $reason,
            'details' => $details,
            'status' => ReportStatus::Open,
        ]);
    }

    public function dismiss(Report $report, User $admin): void
    {
        $report->update([
            'status' => ReportStatus::Dismissed,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);
    }

    public function resolve(Report $report, User $admin): void
    {
        $target = $report->reportable;

        if ($target instanceof Post && ! $target->trashed()) {
            $reason = 'Removed after community report: '.$report->reason->label();
            $this->moderation->reject($target, $admin, $reason);
        }

        if ($target instanceof Comment && ! $target->trashed()) {
            $target->delete();
        }

        $report->update([
            'status' => ReportStatus::Reviewed,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);
    }
}

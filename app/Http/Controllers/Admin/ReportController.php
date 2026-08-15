<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Services\AdminAuditLogger;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly AdminAuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Report::class);

        $status = (string) $request->input('status', ReportStatus::Open->value);

        if (! in_array($status, ['open', 'reviewed', 'dismissed', 'all'], true)) {
            $status = ReportStatus::Open->value;
        }

        $reports = Report::query()
            ->with(['reporter', 'reportable'])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Report $report) => $this->row($report));

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
            'filters' => ['status' => $status],
        ]);
    }

    public function dismiss(Request $request, Report $report): RedirectResponse
    {
        $this->authorize('update', $report);

        $this->reports->dismiss($report, $request->user());

        $this->audit->log($request->user(), 'report.dismissed', $report, [], $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Report dismissed.')]);

        return back();
    }

    public function resolve(Request $request, Report $report): RedirectResponse
    {
        $this->authorize('update', $report);

        $this->reports->resolve($report, $request->user());

        $this->audit->log(
            $request->user(),
            'report.resolved',
            $report,
            ['reason' => $report->reason->value],
            $request,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Report resolved.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Report $report): array
    {
        $target = $report->reportable;

        return [
            'id' => $report->id,
            'reason' => $report->reason->value,
            'reason_label' => $report->reason->label(),
            'details' => $report->details,
            'status' => $report->status->value,
            'created_at' => $report->created_at?->toIso8601String(),
            'reporter' => [
                'id' => $report->reporter->id,
                'name' => $report->reporter->name,
                'username' => $report->reporter->username,
            ],
            'target' => $this->targetPayload($target),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function targetPayload(mixed $target): array
    {
        if ($target instanceof Post) {
            $url = null;
            $first = $target->relationLoaded('media')
                ? $target->media->first()
                : $target->media()->first();

            if ($first !== null) {
                $url = $first->url();
            }

            return [
                'type' => 'post',
                'id' => $target->id,
                'body' => Str::limit($target->body, 180),
                'deleted' => $target->trashed(),
                'href' => '/posts/'.$target->id,
                'thumb' => $url,
            ];
        }

        if ($target instanceof Comment) {
            return [
                'type' => 'comment',
                'id' => $target->id,
                'body' => Str::limit($target->body, 180),
                'deleted' => $target->trashed(),
                'href' => $target->post_id ? '/posts/'.$target->post_id : null,
                'thumb' => null,
            ];
        }

        return [
            'type' => 'unknown',
            'id' => null,
            'body' => 'Unavailable',
            'deleted' => true,
            'href' => null,
            'thumb' => null,
        ];
    }
}

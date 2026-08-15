<?php

namespace App\Http\Controllers;

use App\Enums\ReportReason;
use App\Http\Requests\StoreReportRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function store(StoreReportRequest $request): RedirectResponse
    {
        $target = $this->resolveTarget(
            (string) $request->validated('reportable_type'),
            (int) $request->validated('reportable_id'),
        );

        $this->authorize('create', [Report::class, $target]);

        $this->reports->submit(
            $request->user(),
            $target,
            ReportReason::from((string) $request->validated('reason')),
            $request->validated('details'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Report submitted.')]);

        return back();
    }

    private function resolveTarget(string $type, int $id): Model
    {
        $target = match ($type) {
            'post' => Post::query()->find($id),
            'comment' => Comment::query()->find($id),
            default => null,
        };

        abort_if($target === null, 404);

        return $target;
    }
}

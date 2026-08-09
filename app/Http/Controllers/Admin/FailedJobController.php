<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use stdClass;

class FailedJobController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $jobs = DB::table('failed_jobs')
            ->orderByDesc('failed_at')
            ->paginate(20)
            ->through(function (stdClass $job): array {
                $payload = json_decode((string) $job->payload, true);
                $displayName = is_array($payload)
                    ? ($payload['displayName'] ?? $payload['job'] ?? 'Unknown')
                    : 'Unknown';

                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'display_name' => $displayName,
                    'failed_at' => $job->failed_at,
                    'exception' => mb_substr((string) $job->exception, 0, 500),
                ];
            });

        return Inertia::render('admin/failed-jobs/index', [
            'jobs' => $jobs,
        ]);
    }
}

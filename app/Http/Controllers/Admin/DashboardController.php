<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly AdminMetricsService $metrics) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        return Inertia::render('admin/dashboard', [
            'metrics' => $this->metrics->snapshot(),
        ]);
    }
}

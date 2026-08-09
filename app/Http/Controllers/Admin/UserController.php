<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly AdminAuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->value,
                'suspended_at' => $user->suspended_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('suspend', $user);

        $validated = $request->validate([
            'suspended' => ['required', 'boolean'],
        ]);

        $user->update([
            'suspended_at' => $validated['suspended'] ? now() : null,
        ]);

        $this->audit->log(
            $request->user(),
            $validated['suspended'] ? 'user.suspended' : 'user.unsuspended',
            $user,
            ['username' => $user->username],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['suspended']
                ? __('User suspended.')
                : __('User unsuspended.'),
        ]);

        return back();
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Models\User;
use App\Services\AdminAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly AdminAuditLogger $audit,
        private readonly CreateNewUser $creator,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $q = trim((string) $request->input('q', ''));

        $users = User::query()
            ->when($q !== '', function ($query) use ($q): void {
                $like = '%'.$q.'%';
                $query->where(function ($inner) use ($like): void {
                    $inner->where('name', 'like', $like)
                        ->orWhere('username', 'like', $like)
                        ->orWhere('email', 'like', $like);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
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
            'filters' => ['q' => $q],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $user = $this->creator->provision($request->validated(), verified: true);

        $actor = $request->user();
        assert($actor instanceof User);

        $this->audit->log(
            $actor,
            'user.created',
            $user,
            [
                'username' => $user->username,
                'email' => $user->email,
            ],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User created.'),
        ]);

        return back();
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

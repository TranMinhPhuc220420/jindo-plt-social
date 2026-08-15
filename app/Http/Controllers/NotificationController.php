<?php

namespace App\Http\Controllers;

use App\Services\UnreadBadgeBroadcaster;
use App\Support\NotificationPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $paginator = $request->user()
            ->notifications()
            ->paginate(20);

        // Present before marking so the first paint can still show “New” styling.
        $presented = collect(NotificationPresenter::collection($paginator->getCollection()))
            ->keyBy('id');

        $request->user()->unreadNotifications->markAsRead();
        app(UnreadBadgeBroadcaster::class)->publish($request->user());

        return Inertia::render('notifications/index', [
            'notifications' => $paginator->through(
                fn (DatabaseNotification $notification): array => $presented->get($notification->id) ?? [],
            ),
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        $notification->markAsRead();
        app(UnreadBadgeBroadcaster::class)->publish($request->user());

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        app(UnreadBadgeBroadcaster::class)->publish($request->user());

        return back();
    }
}

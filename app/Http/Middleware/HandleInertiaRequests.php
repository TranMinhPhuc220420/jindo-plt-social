<?php

namespace App\Http\Middleware;

use App\Services\ExploreService;
use App\Support\NotificationPresenter;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'tagline' => config('app.tagline'),
            'subtitle' => config('app.subtitle'),
            'canRegister' => (bool) config('fortify.public_registration'),
            'auth' => [
                'user' => $user,
                // Closures resolve after the controller so mark-read on index is reflected.
                'unread_notifications_count' => fn () => $user
                    ? $user->unreadNotifications()->count()
                    : 0,
                'unread_messages_count' => 0,
            ],
            'recent_notifications' => fn () => $user
                ? NotificationPresenter::collection(
                    $user->notifications()->limit(8)->get(),
                )
                : [],
            'trending_tags' => $user && $request->routeIs('feed', 'search', 'tags.show')
                ? app(ExploreService::class)->trendingTags(7, 8)
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'realtime' => [
                'driver' => $this->realtimeDriver(),
            ],
        ];
    }

    /**
     * Driver the frontend should subscribe with. Must match BROADCAST_CONNECTION
     * so leftover VITE_FIREBASE_* cannot steal Echo, and vice versa.
     */
    private function realtimeDriver(): ?string
    {
        $driver = config('broadcasting.default');

        if ($driver === 'firebase' || $driver === 'reverb') {
            return $driver;
        }

        return null;
    }
}
